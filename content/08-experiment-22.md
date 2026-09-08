<h1 id="exp-22-3-qubit-error-correction-bit-flip-and-phase-flip-codes">Exp. 22: 3-Qubit Error Correction — Bit-Flip and Phase-Flip Codes</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>22</strong></p><p>3 hrs</p></td><td><p><strong>3-Qubit Error Correction — Bit-Flip and Phase-Flip Codes</strong></p><p>QEC Basic | Cluster III</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Implement both the 3-qubit bit-flip code and 3-qubit phase-flip code; inject controlled X and Z errors; verify syndrome measurement correctly identifies and corrects all single-qubit errors.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-6">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image9.png"/></figure><figure class="book-figure"><img loading="lazy" src="content/images/image10.png"/></figure><p>3-Qubit Bit-Flip Code [[3,1,3]]: logical encoding |0⟩_L=|000⟩, |1⟩_L=|111⟩. Syndrome measurement using stabilisers  and : (0,0)→no error; (1,0)→X on Q0; (1,1)→X on Q1; (0,1)→X on Q2. The code corrects any single X (bit-flip) error but NOT Z (phase-flip) errors. Phase-flip code: apply Hadamard before and after the bit-flip code to correct Z errors. The Shor 9-qubit code concatenates both to correct any single-qubit error [[9,1,3]].</p><h2 id="2-qiskit-code-6">2. Qiskit Code</h2><h3 id="first-program-simple-version-6">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 22 — First Program
# 3-Qubit Error Correction — Bit-Flip and Phase-Flip Codes
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

theta = 0.9
qc = QuantumCircuit(3, 1)
qc.ry(theta, 0)
qc.cx(0, 1); qc.cx(0, 2)
qc.barrier()
qc.x(1)
qc.barrier()
qc.cx(0, 1); qc.cx(0, 2)
qc.ccx(1, 2, 0)
qc.measure(0, 0)

sim = AerSimulator()
shots = 4096
counts = sim.run(transpile(qc, sim), shots=shots).result().get_counts()

qc_ref = QuantumCircuit(3, 1)
qc_ref.ry(theta, 0)
qc_ref.measure(0, 0)
counts_ref = sim.run(transpile(qc_ref, sim), shots=shots).result().get_counts()

print(f'Reference (no encoding, no error): {counts_ref}')
print(f'Corrected (encoded, error on Q1):  {counts}')
print(f'P(1) reference = {counts_ref.get("1",0)/shots:.4f}')
print(f'P(1) corrected = {counts.get("1",0)/shots:.4f}')
print('Match confirms the single-qubit bit-flip error was fully corrected.')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Reference (no encoding, no error): {'1': 734, '0': 3362}
  Corrected (encoded, error on Q1):  {'1': 735, '0': 3361}
  P(1) reference = 0.1792
  P(1) corrected = 0.1794
  Match confirms the single-qubit bit-flip error was fully corrected.</code></pre><h3 id="full-program-complete-version-6">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 22: 3-Qubit Error Correction — Bit-Flip and Phase-Flip Codes
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import numpy as np, matplotlib.pyplot as plt

theta = 0.9
sim = AerSimulator()

def bitflip_circuit(error_qubit=None, phase_code=False):
    qc = QuantumCircuit(3, 1)
    if phase_code:
        qc.ry(theta, 0); qc.h(0)
        qc.cx(0, 1); qc.cx(0, 2)
        qc.h([0, 1, 2])
    else:
        qc.ry(theta, 0)
        qc.cx(0, 1); qc.cx(0, 2)
    qc.barrier()
    if error_qubit is not None:
        if phase_code:
            qc.z(error_qubit)
        else:
            qc.x(error_qubit)
    qc.barrier()
    if phase_code:
        qc.h([0, 1, 2])
        qc.cx(0, 1); qc.cx(0, 2)
        qc.ccx(1, 2, 0)
        qc.h(0)
    else:
        qc.cx(0, 1); qc.cx(0, 2)
        qc.ccx(1, 2, 0)
    qc.measure(0, 0)
    return qc

qc_ref = QuantumCircuit(3, 1)
qc_ref.ry(theta, 0)
qc_ref.measure(0, 0)
shots = 4096
ref_counts = sim.run(transpile(qc_ref, sim), shots=shots).result().get_counts()
p1_ref = ref_counts.get('1', 0) / shots
print(f'Reference P(1) = {p1_ref:.4f}\n')

print('--- Bit-flip code: error at each location ---')
bitflip_results = {}
for loc in [None, 0, 1, 2]:
    qc = bitflip_circuit(loc, phase_code=False)
    counts = sim.run(transpile(qc, sim), shots=shots).result().get_counts()
    p1 = counts.get('1', 0) / shots
    bitflip_results[loc] = p1
    label = 'no error' if loc is None else f'X error on Q{loc}'
    print(f'{label:16s}: P(1)={p1:.4f}  deviation from reference = {abs(p1-p1_ref):.4f}')

print('\n--- Phase-flip code: error at each location ---')
phaseflip_results = {}
for loc in [None, 0, 1, 2]:
    qc = bitflip_circuit(loc, phase_code=True)
    counts = sim.run(transpile(qc, sim), shots=shots).result().get_counts()
    p1 = counts.get('1', 0) / shots
    phaseflip_results[loc] = p1
    label = 'no error' if loc is None else f'Z error on Q{loc}'
    print(f'{label:16s}: P(1)={p1:.4f}  deviation from reference = {abs(p1-p1_ref):.4f}')

qc_uncorrected = QuantumCircuit(3, 1)
qc_uncorrected.ry(theta, 0)
qc_uncorrected.cx(0, 1); qc_uncorrected.cx(0, 2)
qc_uncorrected.x(0)
qc_uncorrected.measure(0, 0)
counts_unc = sim.run(transpile(qc_uncorrected, sim), shots=shots).result().get_counts()
p1_unc = counts_unc.get('1', 0) / shots
print(f'\nUncorrected reference (error on Q0, NO decoding circuit applied): P(1)={p1_unc:.4f}')
print(f'(shows the raw damage an uncorrected error causes on the readout qubit)')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
labels = ['none', 'Q0', 'Q1', 'Q2']
axes[0].bar(labels, [bitflip_results[k] for k in [None,0,1,2]], color='#4C72B0')
axes[0].axhline(p1_ref, color='red', linestyle='--', label=f'Reference={p1_ref:.3f}')
axes[0].set_title('Bit-Flip Code: P(1) After Correction'); axes[0].set_ylabel('P(1)'); axes[0].legend()

axes[1].bar(labels, [phaseflip_results[k] for k in [None,0,1,2]], color='#55A868')
axes[1].axhline(p1_ref, color='red', linestyle='--', label=f'Reference={p1_ref:.3f}')
axes[1].set_title('Phase-Flip Code: P(1) After Correction'); axes[1].set_ylabel('P(1)'); axes[1].legend()

plt.tight_layout()
plt.savefig('lab22_qec_full_analysis.png', dpi=150)
plt.show()

print('\nSummary: both codes recover the reference statistics (within shot noise) for a')
print('single-qubit error at ANY of the three locations, confirming the [[3,1,3]] code')
print('corrects exactly one bit-flip (or, in the Hadamard-rotated basis, one phase-flip).')</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 22 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 22:
  3-Qubit Bit-Flip Code [[3,1,3]]: logical encoding |0⟩_L=|000⟩, |1⟩_L=|111⟩. Syndrome measurement using stabilisers S₁=Z₀Z₁ and S₂=Z₁Z₂: (0,0)→no error...
  Actual console output for Experiment 22:
  Reference P(1) = 0.1985
  --- Bit-flip code: error at each location ---
  no error        : P(1)=0.1814  deviation from reference = 0.0171
  X error on Q0   : P(1)=0.1921  deviation from reference = 0.0063
  X error on Q1   : P(1)=0.1887  deviation from reference = 0.0098
  X error on Q2   : P(1)=0.1934  deviation from reference = 0.0051
  --- Phase-flip code: error at each location ---
  no error        : P(1)=0.1885  deviation from reference = 0.0100
  Z error on Q0   : P(1)=0.1941  deviation from reference = 0.0044
  Z error on Q1   : P(1)=0.1877  deviation from reference = 0.0107
  Z error on Q2   : P(1)=0.1819  deviation from reference = 0.0166
  Uncorrected reference (error on Q0, NO decoding circuit applied): P(1)=0.8145
  (shows the raw damage an uncorrected error causes on the readout qubit)
  Summary: both codes recover the reference statistics (within shot noise) for a
  single-qubit error at ANY of the three locations, confirming the [[3,1,3]] code
  corrects exactly one bit-flip (or, in the Hadamard-rotated basis, one phase-flip).</pre><img class="fig-img" src="content/images/image11.png"/></div><h2 id="3-observation-and-results-6">3. Observation and Results</h2><h3 id="observation-tables">Observation Tables</h3><p><em>Record all experimental data for Experiment 22 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
<colgroup>
<col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/><col style="width: 20%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter / Quantity</strong></td><td><strong>Expected Value</strong></td><td><strong>Simulation Value</strong></td><td><strong>Hardware Value</strong></td><td><strong>Analysis / Notes</strong></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions-6">4. Discussion Questions</h2><ol type="1"><li><p>Why does the CX;CX;CCX decoding circuit correctly restore qubit 0 for a single-qubit bit-flip error at any of the three locations, but would fail if two qubits were flipped simultaneously?</p></li><li><p>The phase-flip code is built by conjugating the bit-flip code with Hadamard gates on every qubit. Why does this transformation turn Z errors into X errors (and vice versa), and why can't a single [[3,1,3]] code correct both error types at once?</p></li><li><p>If you had a noise model that applied BOTH a bit-flip and a phase-flip to the same physical qubit (i.e. a Y error), would the 3-qubit bit-flip code alone be enough to protect against it? Explain why or why not.</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-6">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab22_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is a quantum error correcting code [[n,k,d]]?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>[[n,k,d]]: n physical qubits encode k logical qubits with distance d. The code corrects any error on ⌊(d-1)/2⌋ qubits. 3-qubit bit-flip code: [[3,1,3]] — 3 physical, 1 logical, d=3, corrects 1 bit-flip. Steane: [[7,1,3]] — corrects any single qubit X or Z. Surface code: [[d²,1,d]] — leading candidate for fault-tolerant computing, threshold ~1%.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is a stabiliser code?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A stabiliser code is defined by n-k commuting Pauli operators {S₁,...,S_{n-k}} (stabilisers). Code space = +1 eigenspace of all stabilisers: S|ψ_L⟩=|ψ_L⟩. For 3-qubit bit-flip: S₁=Z₀Z₁, S₂=Z₁Z₂. Syndrome: measure each stabiliser → eigenvalue +1 (no error) or -1 (error). The pattern of -1 eigenvalues identifies error location and type.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>Why can't the 3-qubit bit-flip code correct phase (Z) errors?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The stabilisers S₁=Z₀Z₁ and S₂=Z₁Z₂ commute with Z errors on any qubit (ZᵢZᵢZᵢ=Zᵢ), so Z errors give syndrome (0,0) — indistinguishable from no error. Z errors act as logical Z (Z_L) on the encoded state. The bit-flip code is designed to detect/correct only X errors. To correct Z errors: use the phase-flip code (Hadamard-conjugated bit-flip code). The Shor 9-qubit code handles both.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is the threshold theorem for QEC?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>If physical gate error rate p &lt; p_th (threshold, ~1% for surface code), then arbitrarily long quantum computations can be performed fault-tolerantly with only polynomial overhead. Below threshold: more encoding reduces logical error rate exponentially. Above: more encoding amplifies errors. IBM hardware: p_CX ≈ 0.1-1%, approaching the surface code threshold. This is why error correction is a central research goal.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is the surface code?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Surface code [[d²,1,d]]: 2D lattice of qubits. Plaquette operators (X-type stabilisers) and vertex operators (Z-type stabilisers) on alternating squares. Advantages: (1) high threshold ~1%, (2) only nearest-neighbour CX gates (matches hardware connectivity), (3) efficient classical decoding (minimum-weight perfect matching), (4) scalable. Required: ~1000 physical qubits per logical qubit for practical fault-tolerance.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why is the correction circuit (CX, CX, CCX) described as 'measurement-free' or 'coherent' error correction?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>It restores the correct logical value on qubit 0 purely through unitary gates, without ever performing an intermediate measurement or classical syndrome readout. This preserves any superposition present in the logical qubit throughout the correction process, unlike syndrome-measurement-based decoding which collapses the ancilla but keeps the data qubits coherent only if implemented carefully.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What is the code distance of the [[3,1,3]] bit-flip code, and what does it guarantee?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The code distance is 3, meaning the minimum number of physical bit-flip errors needed to turn one valid codeword into another (undetectable) codeword is 3. A distance-3 code can always correct any single error, since two candidate error patterns of weight 1 differ by weight at most 2, which is still distinguishable.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>Why can't the 3-qubit bit-flip code correct a bit-flip error on two different qubits simultaneously?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Two simultaneous bit-flips move the encoded state to a position in the code space that looks, from the syndrome's perspective, identical to a single bit-flip on the third (unaffected) qubit. The decoder would then apply the wrong correction, actually converting the two-qubit error into a full logical error.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>How does applying Hadamard gates before and after the bit-flip encoding turn it into a phase-flip code?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Hadamard conjugation swaps the X and Z operators (HXH=Z and HZH=X). Since the bit-flip code's stabilisers and encoding are built from X-type operations, sandwiching the whole circuit in Hadamards converts every X error the code was designed to catch into an equivalent Z error, and vice versa.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What is meant by the 'threshold theorem' in the context of quantum error correction, and how does this experiment relate to it?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The threshold theorem states that if physical error rates are below some threshold value, concatenating error-correcting codes can suppress logical error rates arbitrarily, enabling scalable fault-tolerant computation. This experiment demonstrates the basic building block (a single level of encoding and correction) that such concatenated schemes are built from.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>Why does the reference circuit (no encoding, no error) matter for interpreting the corrected circuit's results?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Since the logical state is a superposition (Ry(theta)), the corrected circuit's output statistics should match those of directly measuring the unencoded state, not simply return |0&gt; or |1&gt; deterministically. The reference provides the ground truth to confirm the encoding-error-correction cycle is statistically transparent.</td></tr>
<tr class="even"><td><strong>Q12</strong></td><td><strong>What would happen if you injected TWO errors of the SAME type on the SAME qubit (e.g. two X gates on qubit 1)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Two X gates on the same qubit cancel out (X*X=Identity), so the qubit returns to its error-free state before the correction circuit even runs. The decoder would correctly see no error, since physically there isn't one anymore.</td></tr>
<tr class="even"><td><strong>Q13</strong></td><td><strong>Why is the majority-vote logic (CCX conditioned on the two other qubits) equivalent to classical majority-vote decoding?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The CCX flips qubit 0 only if BOTH of the other two syndrome bits are 1, which (given the encoding structure) exactly identifies the case where qubit 0 is the outlier relative to the other two. This mirrors classical majority-vote: if two syndrome indicators agree, the odd-one-out must be corrected.</td></tr>
<tr class="even"><td><strong>Q14</strong></td><td><strong>Why is fidelity = 1.0 achievable in simulation but not on real hardware for this experiment?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The simulator applies gates exactly, so the correction circuit exactly undoes a genuine single-qubit error. On real hardware, additional uncorrected noise sources (gate errors on the CORRECTION gates themselves, decoherence, and readout error) introduce extra imperfections that the code was never designed to catch, since it only protects against ONE modeled error type at a time.</td></tr>
</tbody>
</table>