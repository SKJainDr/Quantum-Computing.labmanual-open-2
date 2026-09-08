<h1 id="exp-25-ising-model-trotter-simulation-on-ibm-hardware">Exp. 25: Ising Model Trotter Simulation on IBM Hardware</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>25</strong></p><p>4 hrs</p></td><td><p><strong>Ising Model Trotter Simulation on IBM Hardware</strong></p><p>Quantum Simulation | IBM Hardware Required | Cluster IV</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Simulate 4-qubit transverse-field Ising model dynamics using Trotter decomposition; compute magnetisation ⟨Z₀⟩ vs time; execute on IBM hardware and compare with exact matrix exponentiation.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-9">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image15.png"/></figure><p>Transverse-Field Ising Model:  (J=1, h=0.5, periodic boundary). First-order Trotter: U(t) ≈ (e^{−iH_{ZZ}Δt}·e^{−iH_XΔt})^N where Δt=t/N. Trotter error: O(t·Δt) for first-order. Gate decomposition: e^{−iJ·ZᵢZⱼ·Δt} = CX·Rz(2JΔt)·CX; e^{−ih·Xᵢ·Δt} = Rx(2hΔt). Quantum phase transition at h/J=1 (1D): ferromagnetic to paramagnetic. Initial state: |0000⟩ (⟨Z₀⟩=1 at t=0, oscillates due to transverse field).</p><h2 id="2-qiskit-code-9">2. Qiskit Code</h2><h3 id="first-program-simple-version-9">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 25 — First Program
# Ising Model Trotter Simulation on IBM Hardware
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import numpy as np

n_sites = 4
J, h = 1.0, 0.5
t_total = 1.0
n_steps = 4
dt = t_total / n_steps

def trotter_step(qc, dt):
    for i in range(n_sites):
        j = (i + 1) % n_sites
        qc.cx(i, j)
        qc.rz(2 * J * dt, j)
        qc.cx(i, j)
    for i in range(n_sites):
        qc.rx(2 * h * dt, i)

qc = QuantumCircuit(n_sites, n_sites)
for _ in range(n_steps):
    trotter_step(qc, dt)
qc.measure(range(n_sites), range(n_sites))

sim = AerSimulator()
counts = sim.run(transpile(qc, sim), shots=4096).result().get_counts()

z0 = sum((1 if k[-1] == '0' else -1) * v for k, v in counts.items()) / 4096
print(f'Transverse-field Ising model, {n_sites} sites, J={J}, h={h}')
print(f'Trotter steps = {n_steps}, total time t = {t_total}')
print(f'&lt;Z_0&gt;(t={t_total}) = {z0:+.4f}   (expect close to +1 for small t: field has not yet decorrelated the state)')
print(f'Top outcomes: {sorted(counts.items(), key=lambda x: -x[1])[:5]}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Transverse-field Ising model, 4 sites, J=1.0, h=0.5
  Trotter steps = 4, total time t = 1.0
  &lt;Z_0&gt;(t=1.0) = +0.8652   (expect close to +1 for small t: field has not yet decorrelated the state)
  Top outcomes: [('0000', 3302), ('0100', 145), ('0010', 125), ('1000', 119), ('0001', 106)]</code></pre><h3 id="full-program-complete-version-9">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 25: Ising Model Trotter Simulation on IBM Hardware
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector, SparsePauliOp
from qiskit_aer import AerSimulator
import numpy as np, matplotlib.pyplot as plt

n_sites = 4
J, h = 1.0, 0.5

def trotter_circuit(t_total, n_steps):
    dt = t_total / n_steps
    qc = QuantumCircuit(n_sites, n_sites)
    for _ in range(n_steps):
        for i in range(n_sites):
            j = (i + 1) % n_sites
            qc.cx(i, j); qc.rz(2 * J * dt, j); qc.cx(i, j)
        for i in range(n_sites):
            qc.rx(2 * h * dt, i)
    return qc

times = np.linspace(0, 3, 16)
sim = AerSimulator()

print('--- &lt;Z_0&gt;(t) time evolution, comparing Trotter resolutions ---')
results = {}
for n_steps in [2, 4, 8]:
    z_vals = []
    for t in times:
        qc = trotter_circuit(t, n_steps) if t &gt; 0 else QuantumCircuit(n_sites)
        sv = Statevector(qc)
        z_vals.append(np.real(sv.expectation_value(SparsePauliOp('IIIZ'))))
    results[n_steps] = z_vals
    print(f'n_steps={n_steps}: &lt;Z_0&gt; at t=3.0 -&gt; {z_vals[-1]:+.4f}')

t_fixed = 2.0
step_counts = [1, 2, 4, 8, 16, 32]
errors = []
ref_qc = trotter_circuit(t_fixed, 64)
ref_sv = Statevector(ref_qc)
ref_z0 = np.real(ref_sv.expectation_value(SparsePauliOp('IIIZ')))
for n_steps in step_counts:
    qc = trotter_circuit(t_fixed, n_steps)
    sv = Statevector(qc)
    z0 = np.real(sv.expectation_value(SparsePauliOp('IIIZ')))
    err = abs(z0 - ref_z0)
    errors.append(err)
    print(f'n_steps={n_steps:3d}: &lt;Z_0&gt;={z0:+.4f}  |error vs fine ref|={err:.5f}')

try:
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    service = QiskitRuntimeService()
    backend = service.least_busy(operational=True, simulator=False)
    print(f'\nSelected backend: {backend.name}')
    qc_hw = trotter_circuit(1.0, 4)
    qc_hw.measure(range(n_sites), range(n_sites))
    tqc = transpile(qc_hw, backend, optimization_level=3)
    job = Sampler(backend).run([tqc], shots=4096)
    print(f'IBM Quantum Job ID: {job.job_id()}')
    hw_counts = job.result()[0].data.c.get_counts()
    hw_z0 = sum((1 if k[-1]=='0' else -1)*v for k,v in hw_counts.items()) / 4096
    print(f'Hardware &lt;Z_0&gt;(t=1.0) = {hw_z0:+.4f}')
except Exception as exc:
    print(f'\n[IBM Quantum hardware not reachable in this session: {exc}]')
    print('Save your IBM Quantum API token first (see Section 1.6), then re-run.')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for n_steps in [2, 4, 8]:
    axes[0].plot(times, results[n_steps], 'o-', label=f'{n_steps} Trotter steps', markersize=4)
axes[0].set_xlabel('time t'); axes[0].set_ylabel('&lt;Z_0&gt;(t)')
axes[0].set_title('Ising Model Time Evolution'); axes[0].legend(fontsize=8)

axes[1].loglog(step_counts, errors, 'o-', color='#C44E52')
axes[1].set_xlabel('Trotter steps N'); axes[1].set_ylabel('|error| vs fine reference')
axes[1].set_title(f'Trotter Error Scaling (t={t_fixed})')

plt.tight_layout()
plt.savefig('lab25_ising_trotter_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 25 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 25:
  Transverse-Field Ising Model: H = −JΣᵢZᵢZᵢ₊₁ − hΣᵢXᵢ (J=1, h=0.5, periodic boundary). First-order Trotter: U(t) ≈ (e^{−iH_{ZZ}Δt}·e^{−iH_XΔt})^N where...
  Actual console output for Experiment 25:
  --- &lt;Z_0&gt;(t) time evolution, comparing Trotter resolutions ---
  n_steps=2: &lt;Z_0&gt; at t=3.0 -&gt; -0.9701
  n_steps=4: &lt;Z_0&gt; at t=3.0 -&gt; +0.7541
  n_steps=8: &lt;Z_0&gt; at t=3.0 -&gt; +0.8550
  n_steps=  1: &lt;Z_0&gt;=-0.4161  |error vs fine ref|=1.30607
  n_steps=  2: &lt;Z_0&gt;=+0.3402  |error vs fine ref|=0.54971
  n_steps=  4: &lt;Z_0&gt;=+0.8327  |error vs fine ref|=0.05720
  n_steps=  8: &lt;Z_0&gt;=+0.8779  |error vs fine ref|=0.01206
  n_steps= 16: &lt;Z_0&gt;=+0.8872  |error vs fine ref|=0.00276
  n_steps= 32: &lt;Z_0&gt;=+0.8894  |error vs fine ref|=0.00055</pre><img class="fig-img" src="content/images/image16.png"/></div><h2 id="3-observation-and-results-9">3. Observation and Results</h2><h3 id="observation-tables-3">Observation Tables</h3><p><em>Record all experimental data for Experiment 25 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h3 id="ibm-hardware-execution-record">IBM Hardware Execution Record</h3><table>
<colgroup>
<col style="width: 50%"/><col style="width: 50%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Parameter</strong></td><td><strong>Value Recorded</strong></td></tr>
<tr class="even"><td>Device Name</td><td></td></tr>
<tr class="odd"><td>Qubits Used</td><td></td></tr>
<tr class="even"><td>T₁ (μs) per qubit</td><td></td></tr>
<tr class="odd"><td>T₂ (μs) per qubit</td><td></td></tr>
<tr class="even"><td>CX / Gate Error Rate</td><td></td></tr>
<tr class="odd"><td>Readout Error</td><td></td></tr>
<tr class="even"><td>Transpiled Circuit Depth</td><td></td></tr>
<tr class="odd"><td>Optimisation Level</td><td></td></tr>
<tr class="even"><td>Shot Count</td><td></td></tr>
<tr class="odd"><td>IBM Quantum Job ID</td><td></td></tr>
<tr class="even"><td>Submission Date/Time</td><td></td></tr>
<tr class="odd"><td>Queue Wait (min)</td><td></td></tr>
<tr class="even"><td>Hardware Counts</td><td></td></tr>
<tr class="odd"><td>Simulation Counts</td><td></td></tr>
<tr class="even"><td>Error Rate (%)</td><td></td></tr>
<tr class="odd"><td>Mitigation Applied?</td><td></td></tr>
</tbody>
</table><h2 id="4-discussion-questions-9">4. Discussion Questions</h2><ol type="1"><li><p>Why does the Trotter error shrink roughly by half each time you double the number of Trotter steps, and what does the log-log error plot's slope tell you about this scaling?</p></li><li><p>The single-step circuit implements exp(-i*J*dt*Z⊗Z) via CX-RZ-CX. Explain why this specific gate sequence correctly implements that two-qubit interaction.</p></li><li><p>If the transverse field strength h were increased relative to J, would you expect &lt;Z_0&gt;(t) to decorrelate faster or slower? Explain your reasoning in terms of the competition between the two terms in the Hamiltonian.</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-9">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab25_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Execute on IBM Quantum hardware. Record Job ID immediately after submission.</p></li><li><p>Compare hardware vs simulation results. Calculate error rate and improvement from any mitigation applied.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is the Trotter-Suzuki decomposition and its error?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Trotter-Suzuki: e^{−i(A+B)t} ≈ (e^{−iAt/N}e^{−iBt/N})^N for large N. First-order error: O(t·Δt) total where Δt=t/N. Second-order (symmetric Trotter): e^{−iAdt/2}e^{−iBdt}e^{−iAdt/2} has O(dt²) per step, O(t·dt²) total. Reducing dt improves accuracy but increases circuit depth. For NISQ: optimal dt balances Trotter error with hardware gate error.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is quantum simulation and its advantage over classical simulation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Quantum simulation: use a controllable quantum system to simulate another quantum system. Classical: exponentially hard (2^n state space). Quantum: O(poly(n)) time. Applications: condensed matter (Hubbard model, topological phases), quantum chemistry (molecular dynamics), quantum field theories. IBM 2023: quantum simulation of 2D Ising model on 127 qubits agreed with exact result where tensor network methods failed — claimed first practical quantum utility.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the transverse-field Ising model significance?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>TFIM: H = −JΣZᵢZᵢ₊₁ − hΣXᵢ. Physical significance: (1) prototype model for quantum phase transitions (ferromagnetic→paramagnetic at h/J=1), (2) exactly solvable in 1D via Jordan-Wigner, (3) paradigm for quantum computing with Rydberg atoms, (4) connection to QAOA (cost Hamiltonian is Ising-like). At h=0: |000..0⟩ is ground state. At J=0: |+++...+⟩. Quantum fluctuations (h term) create dynamical evolution.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>Compare Trotter error with hardware gate error on IBM devices.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>For dt=0.2, 10 steps: Trotter error at t=1.0 ≈ 0.036. IBM hardware error: each Trotter step ~5 CX gates, error per CX ~0.005, total per step ~0.025. Over 5 steps: hardware error ~0.125. Total ≈ 0.161. Hardware dominates! For fault-tolerant hardware with error per CX ~10^{-6}: Trotter error dominates → reducing dt becomes main concern. On NISQ: reducing dt improves Trotter accuracy but increases depth and hardware error — trade-off must be optimised.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What is quantum advantage in simulation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Google (2023): quantum processor demonstrated advantages in sampling from quantum dynamics of a kicked Ising model. IBM (2023): quantum simulation of 2D Ising model on Eagle (127 qubits) agreed with exact result where tensor networks failed. True practical advantage: simulating strongly-correlated fermion systems (Hubbard model at half-filling), quantum field theories at finite density — classically intractable but with clear physical applications. Likely requires fault-tolerant hardware for large-scale impact.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why is the Trotter-Suzuki decomposition necessary at all, instead of directly implementing exp(-iHt) for the full Hamiltonian in one step?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The full Hamiltonian's ZZ and X terms generally do not commute, so exp(-iHt) cannot be exactly factored into a simple product of single- and two-qubit gates. Trotterisation approximates the evolution by alternating short applications of each non-commuting piece, with the approximation becoming exact as the number of steps grows.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What determines the size of the Trotter error at a fixed total evolution time t?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The error depends on the commutator between the ZZ and X terms of the Hamiltonian and scales with (t/n_steps) per step; more Trotter steps means a smaller time increment dt per step, and since the leading-order error scales as O(dt^2) per step (accumulating to O(dt) total), more steps yields a smaller total error.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>Why does the CX-RZ-CX sequence correctly implement the two-qubit ZZ interaction term of the Hamiltonian?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The two CX gates conjugate the RZ rotation, temporarily mapping the parity of the two qubits onto the target qubit; applying RZ there implements a phase that depends on that parity, which is mathematically equivalent to applying exp(-i*theta*Z⊗Z) directly, and the second CX restores the original qubit basis.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why did the 4-site ring topology use periodic boundary conditions (qubit 3 connects back to qubit 0)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Periodic boundary conditions model a genuinely cyclic (ring-shaped) arrangement of spins, which better represents an infinite or bulk system without the edge effects that would appear with open (non-periodic) boundaries on such a small number of sites.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>Why does &lt;Z_0&gt;(t) start at exactly +1 and generally decrease as time progresses?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The initial state (all qubits |0&gt;) is an eigenstate of Z_0 with eigenvalue +1. As the transverse field term (X rotations) drives the system away from this initial state, &lt;Z_0&gt; decreases, reflecting the qubit's decreasing correlation with its initial orientation due to the competing dynamics.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>How would the physics change qualitatively if J were set to zero (turning off the qubit-qubit coupling)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>With J=0 the Hamiltonian reduces to independent single-qubit X-rotations on each site, so there would be no entanglement generated between sites at all; each qubit would simply undergo Rabi-like oscillation under its own local field, completely decoupled from its neighbours.</td></tr>
</tbody>
</table>