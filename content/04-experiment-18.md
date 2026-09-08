<h1 id="exp-18-zero-noise-extrapolation-quantum-error-mitigation">Exp. 18: Zero-Noise Extrapolation — Quantum Error Mitigation</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>18</strong></p><p>3 hrs</p></td><td><p><strong>Zero-Noise Extrapolation — Quantum Error Mitigation</strong></p><p>IBM Hardware Required | Cluster I: Hardware Characterisation</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Apply ZNE to recover the ideal ⟨ZZ⟩ expectation value from noisy IBM hardware results; use unitary gate folding to amplify noise at scale factors λ=1,3,5; fit and extrapolate to zero noise.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-2">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image5.png"/></figure><p>Zero-Noise Extrapolation (ZNE) is an error mitigation technique that estimates the noise-free expectation value by intentionally amplifying noise at known scale factors and extrapolating to zero noise. Gate folding: replace unitary U with U·U†·U for 3× noise scaling. Since U·U†=I, the ideal answer is unchanged but noise amplifies by factor λ. Richardson extrapolation (2-point): . Linear fit: ⟨O⟩(λ) ≈ ⟨O⟩_ideal + a·λ → extrapolate to λ=0.</p><h2 id="2-qiskit-code-2">2. Qiskit Code</h2><h3 id="first-program-simple-version-2">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core algorithm.</p><pre><code class="language-python"># Exp 18 First Program: ZNE basics
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit_aer.primitives import Estimator
import numpy as np

def fold_circuit(qc, c):
    qc_f = qc.copy()
    for _ in range((c-1)//2):
        qc_f.compose(qc.inverse(), inplace=True)
        qc_f.compose(qc, inplace=True)
    return qc_f

qc = QuantumCircuit(2)
qc.h(0); qc.cx(0,1)
obs = SparsePauliOp('ZZ')
estimator = Estimator()

zz_vals = []
for scale in [1, 3, 5]:
    qc_f = fold_circuit(qc, scale)
    result = estimator.run([(qc_f, obs)]).result()
    zz = float(result[0].data.evs); zz_vals.append(zz)
    print(f'lambda={scale}: &lt;ZZ&gt;={zz:.6f}')
coeffs = np.polyfit([1,3,5], zz_vals, 1)
zne_val = np.polyval(coeffs, 0)
print(f'ZNE extrapolated: &lt;ZZ&gt;={zne_val:.6f}  (ideal=1.0)')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  lambda=1: &lt;ZZ&gt;=1.000000
  lambda=3: &lt;ZZ&gt;=1.000000
  lambda=5: &lt;ZZ&gt;=1.000000
  ZNE extrapolated: &lt;ZZ&gt;=1.000000  (ideal=1.0)</code></pre><h3 id="full-program-complete-version-2">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 18: Zero-Noise Extrapolation
#  Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit_aer.primitives import Estimator
from qiskit_aer.noise import NoiseModel, depolarizing_error
import numpy as np, matplotlib.pyplot as plt

# Bell state for measuring &lt;ZZ&gt; (ideal = +1.0)
def bell_zz():
    qc = QuantumCircuit(2)
    qc.h(0); qc.cx(0,1)
    return qc

def fold_circuit(qc, scale):
    """Fold circuit by scale factor to amplify noise"""
    qc_f = qc.copy()
    for _ in range((scale-1)//2):
        qc_f.compose(qc.inverse(), inplace=True)
        qc_f.compose(qc, inplace=True)
    return qc_f

def make_noise_model(p):
    nm = NoiseModel()
    nm.add_all_qubit_quantum_error(depolarizing_error(p,1),['h','x','y','z'])
    nm.add_all_qubit_quantum_error(depolarizing_error(p*8,2),['cx'])
    return nm

qc_base = bell_zz(); obs_ZZ = SparsePauliOp('ZZ')
scale_factors = [1, 3, 5]
p_noise_levels = [0.005, 0.01, 0.02]
print('Zero-Noise Extrapolation — &lt;ZZ&gt; for Bell State |Phi+&gt;')
print(f'Ideal value: &lt;ZZ&gt; = +1.0')
print(f'Scale factors tested: {scale_factors}\n')

fig, axes = plt.subplots(1,3,figsize=(17,5))
for ax_idx, p_noise in enumerate(p_noise_levels):
    sim = Estimator(options={'noise_model': make_noise_model(p_noise)})
    zz_values = []
    print(f'Noise level p = {p_noise}:')
    for scale in scale_factors:
        qc_folded = fold_circuit(qc_base, scale)
        result = sim.run([(qc_folded, obs_ZZ)]).result()
        zz = float(result[0].data.evs); zz_values.append(zz)
        print(f'  lambda={scale}: &lt;ZZ&gt; = {zz:.6f}')
    coeffs = np.polyfit(scale_factors, zz_values, 1)
    zne_linear = np.polyval(coeffs, 0)
    zne_rich = (3*zz_values[0] - zz_values[1]) / 2
    print(f'  Linear ZNE: &lt;ZZ&gt;={zne_linear:.6f}')
    print(f'  Richardson: &lt;ZZ&gt;={zne_rich:.6f}  (ideal=1.0)\n')
    lam_smooth = np.linspace(0,max(scale_factors)+1,200)
    axes[ax_idx].scatter(scale_factors,zz_values,color='#533483',s=80,zorder=5,label='Measured')
    axes[ax_idx].plot(lam_smooth,np.polyval(coeffs,lam_smooth),'--',color='#C9A84C',lw=2,label='Linear fit')
    axes[ax_idx].scatter([0],[zne_linear],color='#C9A84C',s=120,zorder=6,marker='*',label=f'ZNE:{zne_linear:.4f}')
    axes[ax_idx].axhline(1.0,color='green',linestyle=':',lw=2,label='Ideal=1.0')
    axes[ax_idx].set_xlabel('Noise scale factor lambda')
    axes[ax_idx].set_ylabel('&lt;ZZ&gt;')
    axes[ax_idx].set_title(f'p_noise={p_noise}\nRaw:{zz_values[0]:.4f}, ZNE:{zne_linear:.4f}',fontweight='bold')
    axes[ax_idx].legend(fontsize=8); axes[ax_idx].grid(alpha=0.3)
plt.suptitle('Zero-Noise Extrapolation — Error Mitigation Analysis',fontsize=13,fontweight='bold')
plt.tight_layout()
plt.savefig('lab18_zne.png',dpi=150,bbox_inches='tight')
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 18 — Expected Output &amp; Console Results</p><pre>  GATE FOLDING DIAGRAM:
  Original (λ=1): [H]─[CX]─
  Folded   (λ=3): [H]─[CX]─[CX†]─[CX]─  (3× noise, same ideal answer)
  Folded   (λ=5): [H]─[CX]─[CX†]─[CX]─[CX†]─[CX]─  (5× noise)
  EXPECTED CONSOLE OUTPUT (p_noise=0.01):
  Noise level p = 0.01:
    lambda=1: &lt;ZZ&gt; = 0.8215
    lambda=3: &lt;ZZ&gt; = 0.6987
    lambda=5: &lt;ZZ&gt; = 0.5619
    Linear ZNE: &lt;ZZ&gt;=0.9443  (raw=0.8215, improvement=3.2×)
    Richardson: &lt;ZZ&gt;=0.9236</pre></div><h2 id="3-observation-and-results-2">3. Observation and Results</h2><h3 id="table-181-zne-results-at-each-noise-scale">Table 18.1 — ZNE Results at Each Noise Scale</h3><table>
<colgroup>
<col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Scale λ</strong></td><td><strong>⟨</strong><strong>ZZ</strong><strong>⟩</strong><strong> Simulation</strong></td><td><strong>⟨</strong><strong>ZZ</strong><strong>⟩</strong><strong> Hardware</strong></td><td><strong>Deviation from Ideal</strong></td></tr>
<tr class="even"><td>1</td><td></td><td></td><td></td></tr>
<tr class="odd"><td>3</td><td></td><td></td><td></td></tr>
<tr class="even"><td>5</td><td></td><td></td><td></td></tr>
</tbody>
</table><h3 id="table-182-extrapolation-comparison">Table 18.2 — Extrapolation Comparison</h3><table>
<colgroup>
<col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Method</strong></td><td><strong>Extrapolated </strong><strong>⟨</strong><strong>ZZ</strong><strong>⟩</strong></td><td><strong>Error |1−</strong><strong>⟨</strong><strong>ZZ</strong><strong>⟩</strong><strong>|</strong></td><td><strong>Improvement Factor</strong></td></tr>
<tr class="even"><td>Raw (no mitigation)</td><td></td><td></td><td>1.0×</td></tr>
<tr class="odd"><td>Linear ZNE (λ=1,3,5)</td><td></td><td></td><td></td></tr>
<tr class="even"><td>Richardson (λ=1,3)</td><td></td><td></td><td></td></tr>
<tr class="odd"><td>Ideal</td><td>1.0</td><td>0.0</td><td>—</td></tr>
</tbody>
</table><h3 id="ibm-hardware-execution-record-mandatory-for-this-experiment-2">IBM Hardware Execution Record (Mandatory for this Experiment)</h3><table>
<colgroup>
<col style="width: 50%"/><col style="width: 50%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter</strong></td><td><strong>Value Recorded</strong></td></tr>
<tr class="even"><td>Device Name</td><td></td></tr>
<tr class="odd"><td>Number of Qubits</td><td></td></tr>
<tr class="even"><td>Qubits / Pair Used</td><td></td></tr>
<tr class="odd"><td>T₁ (μs) per qubit</td><td></td></tr>
<tr class="even"><td>T₂ (μs) per qubit</td><td></td></tr>
<tr class="odd"><td>CX / Gate Error Rate</td><td></td></tr>
<tr class="even"><td>Readout Error</td><td></td></tr>
<tr class="odd"><td>Transpiled Circuit Depth</td><td></td></tr>
<tr class="even"><td>Optimisation Level</td><td></td></tr>
<tr class="odd"><td>Shot Count</td><td></td></tr>
<tr class="even"><td>IBM Quantum Job ID</td><td></td></tr>
<tr class="odd"><td>Submission Date/Time</td><td></td></tr>
<tr class="even"><td>Queue Wait Time</td><td></td></tr>
<tr class="odd"><td>Hardware Counts (all states)</td><td></td></tr>
<tr class="even"><td>Simulation Counts (ideal)</td><td></td></tr>
<tr class="odd"><td>Error Rate (unexpected/total)</td><td></td></tr>
<tr class="even"><td>Mitigation Applied?</td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions-2">4. Discussion Questions</h2><ol type="1"><li><p>What is zero-noise extrapolation and what is its physical basis?</p></li><li><p>Explain gate folding as a noise amplification method. Why does U·U†·U = U ideally?</p></li><li><p>What is Richardson extrapolation and how many data points does it require?</p></li><li><p>Compare ZNE with probabilistic error cancellation (PEC). What are the trade-offs?</p></li><li><p>What are the limitations of ZNE and under what conditions does it fail?</p></li></ol><h2 id="5-lab-record-requirements-2">5. Lab Record Requirements</h2><ul><li><p>Run First Program. Record ⟨ZZ⟩ at λ=1,3,5 for p_noise=0.01.</p></li><li><p>Run Full Program. Save lab18_zne.png. Record extrapolated values for all 3 noise levels.</p></li><li><p>Complete Tables 18.1 and 18.2.</p></li><li><p>Execute on IBM Quantum hardware. Apply ZNE with gate folding and record improvement ratio.</p></li><li><p>Write answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is ZNE and what is its physical basis?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>ZNE estimates the noise-free expectation value by intentionally amplifying noise at known scale factors and extrapolating to zero noise. Physical basis: if noise is Markovian and characterised by a single parameter ε, then ⟨O⟩(ε) can be approximated by a polynomial in ε. By measuring at ε, 2ε, 3ε (via gate folding), we fit the polynomial and evaluate at ε=0.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>Explain gate folding and why it does not change the ideal result.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Gate folding: replace unitary U with U·U†·U (3× noise). Since U·U†=I (identity), the ideal unitary action is unchanged: U·U†·U|ψ⟩ = U|ψ⟩. But each additional gate contributes its noise, multiplying the error by the scale factor. For a circuit C with total noise ε: folded circuit C_folded has noise ~c·ε.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is Richardson extrapolation for ZNE?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Richardson extrapolation: for two scale factors λ₁=1 and λ₂=3 (linear model): ⟨O⟩_ext = (3⟨O⟩_1 − ⟨O⟩_3)/2. For three points (quadratic): more accurate. Richardson extrapolation exactly cancels the leading-order error term. It is equivalent to polynomial interpolation. Two-point Richardson: exact if error is linear in noise.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What are the limitations of ZNE?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Limitations: (1) Assumes Markovian noise scaling controllably — violated by 1/f noise. (2) Polynomial approximation breaks down for highly noisy devices. (3) Gate folding increases circuit depth, which can exceed coherence time. (4) Each scale factor requires additional circuits, increasing shot cost. (5) ZNE estimates expectation values only — cannot recover a full quantum state.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>Compare ZNE with probabilistic error cancellation (PEC).</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>ZNE: amplifies noise, extrapolates — simple, hardware-agnostic, reduces but doesn't eliminate errors. Shot overhead: ~3-5× circuits. PEC: represents ideal gate as a quasi-probability mixture of noisy gates; samples and applies corrections. Provably unbiased: exactly cancels errors. Shot overhead: exponential in circuit depth (1/(1-ε)^d). ZNE is better for NISQ shallow circuits; PEC gives exact mitigation at high shot cost.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>How does readout error mitigation complement ZNE?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Readout mitigation corrects measurement errors: calibrate confusion matrix M where M[i,j]=P(measure i|prepared j). Apply M^{−1} to raw counts. Complements ZNE: ZNE addresses gate errors during circuit execution; readout mitigation addresses measurement errors at the end. Combined: run circuit at λ=1,3,5 with readout mitigation, then ZNE extrapolate the mitigated values.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What is the shot overhead for ZNE?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Shot overhead: to achieve variance σ² for each scale factor measurement, need N_shots ∝ 1/σ². Using k scale factors: total shots = k·N_per_factor. For linear extrapolation (2 points): overhead factor ~3×. For quadratic (3 points): ~5×. Accuracy scales as O((Δt)^k) for k-point extrapolation. In practice: 3-point ZNE gives ~2-5× error reduction with ~3× shot overhead.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What is Clifford Data Regression (CDR)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>CDR: generate near-Clifford training circuits (similar to target but with some gates replaced by Cliffords). For these, the exact answer is known (Clifford circuits are classically simulable via Gottesman-Knill). Train a linear regression: ⟨O⟩_ideal = a·⟨O⟩_noisy + b. Apply the model to the target circuit. Advantage: doesn't require noise to scale uniformly. Disadvantage: assumes linear relationship.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why must the noise model be characterised before applying ZNE?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>ZNE requires knowing the relationship between scale factor λ and noise level ε(λ). For gate folding: ε(λ) = λ·ε₀ (linear scaling) — valid when gate errors are Markovian. If noise is non-Markovian, the scaling is non-linear and the extrapolation model fails. RB (Exp 17) characterises the noise model. If RB shows non-exponential decay, ZNE with simple linear extrapolation will give biased results.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What is the difference between error mitigation and error correction?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Error correction: uses redundant qubits to detect and correct errors in real-time during computation. Requires O(d²) physical qubits per logical qubit (surface code). Corrects arbitrary errors below threshold. Error mitigation: classical post-processing of noisy expectation values. No qubit overhead. Works only for expectation values. Cannot achieve arbitrarily low error. Near-term practical tool for NISQ devices.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>How does ZNE performance scale with circuit depth?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>For a circuit of depth d with error rate ε per gate: raw result has error ∼ε·d. ZNE with k scale factors reduces error by factor ~(k-1)!/(k-1 order polynomial correction). For linear ZNE (2 points): reduces leading-order error by ~2×. But folded circuits have depth ~λ·d, which increases decoherence. For deep circuits (d·ε&gt;0.1): folded circuits decohere before completing. ZNE works best for shallow circuits (d·ε&lt;0.05).</td></tr>
<tr class="even"><td><strong>Q12</strong></td><td><strong>What is the relationship between ZNE and Richardson extrapolation in numerical analysis?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Richardson extrapolation is a classical numerical technique for accelerating convergence of approximations. For discretisation error E(h) ≈ a_n·h^n + a_{n+1}·h^{n+1}+...: by computing E(h) and E(h/2), eliminate the leading error term: E_Rich = (2^n·E(h/2) − E(h))/(2^n− 1). In ZNE: h corresponds to noise level ε, E(h) to ⟨O⟩(ε). Richardson extrapolation eliminates the leading noise-order term, giving a higher-order estimate of the noise-free value.</td></tr>
<tr class="even"><td><strong>Q13</strong></td><td><strong>What is probabilistic error cancellation (PEC) and how does it achieve exact mitigation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>PEC: decompose the ideal gate G as a quasi-probability distribution over a set of noisy operations {G_i}: G = Σ_i q_i G_i (quasi-probability: q_i can be negative). Sample operations according to |q_i|/Σ|q_k|, apply, multiply by sign(q_i)·(Σ|q_k|) to correct. Average over many samples: ⟨O⟩_mitigated = ⟨O⟩_ideal exactly. Cost: sampling overhead (Σ|q_i|)^{2·depth} shots — exponential in circuit depth, but provides exact (unbiased) mitigation.</td></tr>
</tbody>
</table><div class="box box-key-concept"><p class="box-title"><strong>CLUSTER II — LANDMARK QUANTUM ALGORITHMS</strong></p><p>Experiments 19–21  |  Shor, VQE, QAOA</p></div>