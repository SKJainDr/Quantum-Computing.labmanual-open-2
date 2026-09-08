<h1 id="exp-30-independent-mini-project-novel-quantum-circuit-design">Exp. 30: Independent Mini-Project — Novel Quantum Circuit Design</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>30</strong></p><p>6 hrs</p></td><td><p><strong>Independent Mini-Project — Novel Quantum Circuit Design</strong></p><p>Research Project | IBM Hardware Required | Cluster V</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Design, implement, and analyse an original quantum computing program on IBM Quantum hardware; submit 15-page technical report, GitHub repository, and 20-minute presentation.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-14">1. Background Theory</h2><p>Mini-project is the capstone of the M.Sc. Physics quantum computing laboratory sequence. Requirements: (1) genuine original contribution — not reproduced from textbooks, (2) implementation on IBM Quantum hardware (min 1000 shots, Job ID required), (3) 100+ line Qiskit code on public GitHub with README, (4) 15-page technical report (Introduction, Theory, Implementation, Results, Discussion, Conclusions, References), (5) 20-minute presentation with live code demo. Approved topics: novel oracle design, quantum walk, custom ansatz, advanced QML, novel entanglement protocol, Hamiltonian simulation, error correction innovation, or supervisor-approved topic. Grading: Code+GitHub(20%), Hardware(15%), Report(30%), Presentation(20%), Proposal(5%)=95%+5%=100 marks.</p><h2 id="2-qiskit-code-14">2. Qiskit Code</h2><h3 id="first-program-simple-version-14">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 30 — First Program
# Independent Mini-Project — Novel Quantum Circuit Design
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import numpy as np

pos = 2
coin = 2
qc = QuantumCircuit(pos + 1, pos + 1)
qc.h(coin)

def shift_step(qc):
    qc.cx(coin, 0)
    qc.ccx(coin, 0, 1)
    qc.x(coin)
    qc.cx(coin, 1)
    qc.x(coin)

n_steps = 3
for _ in range(n_steps):
    shift_step(qc)
    qc.h(coin)
qc.measure(range(pos + 1), range(pos + 1))

sim = AerSimulator()
counts = sim.run(transpile(qc, sim), shots=4096).result().get_counts()
pos_counts = {}
for bitstring, c in counts.items():
    p = bitstring[1:]
    pos_counts[p] = pos_counts.get(p, 0) + c

print(f'Discrete-time quantum walk on a 4-cycle, {n_steps} steps:')
for p in sorted(pos_counts):
    print(f'  position {int(p,2)}: {pos_counts[p]} counts ({pos_counts[p]/4096:.4f})')
print('\nUnlike a classical random walk (binomial, peaked at the centre), the quantum')
print('walk shows a distinctly non-uniform, interference-shaped distribution.')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Discrete-time quantum walk on a 4-cycle, 3 steps:
    position 0: 513 counts (0.1252)
    position 1: 523 counts (0.1277)
    position 2: 529 counts (0.1292)
    position 3: 2531 counts (0.6179)

  Unlike a classical random walk (binomial, peaked at the centre), the quantum
  walk shows a distinctly non-uniform, interference-shaped distribution.</code></pre><h3 id="full-program-complete-version-14">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 30: Independent Mini-Project — Novel Quantum Circuit Design
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
import numpy as np, matplotlib.pyplot as plt

pos, coin = 2, 2
sim = AerSimulator()

def shift_step(qc):
    qc.cx(coin, 0)
    qc.ccx(coin, 0, 1)
    qc.x(coin)
    qc.cx(coin, 1)
    qc.x(coin)

def dtqw_circuit(n_steps, coin_init='h'):
    qc = QuantumCircuit(pos + 1, pos + 1)
    if coin_init == 'h':
        qc.h(coin)
    for _ in range(n_steps):
        shift_step(qc)
        qc.h(coin)
    qc.measure(range(pos + 1), range(pos + 1))
    return qc

def position_distribution(counts, shots):
    pos_counts = {}
    for bitstring, c in counts.items():
        p = int(bitstring[1:], 2)
        pos_counts[p] = pos_counts.get(p, 0) + c
    return [pos_counts.get(p, 0) / shots for p in range(4)]

shots = 8192
print('--- Quantum walk position distribution vs step count ---')
qw_dists = {}
for n_steps in [1, 2, 3, 4, 5]:
    qc = dtqw_circuit(n_steps)
    counts = sim.run(transpile(qc, sim), shots=shots).result().get_counts()
    dist = position_distribution(counts, shots)
    qw_dists[n_steps] = dist
    print(f'steps={n_steps}: ' + '  '.join(f'P({p})={d:.3f}' for p, d in enumerate(dist)))

rng = np.random.default_rng(0)
def classical_walk(n_steps, n_trials=20000):
    positions = np.zeros(n_trials, dtype=int)
    for _ in range(n_steps):
        steps = rng.choice([-1, 1], size=n_trials)
        positions = (positions + steps) % 4
    dist = [np.mean(positions == p) for p in range(4)]
    return dist

print('\n--- Classical random walk position distribution (Monte Carlo) ---')
cl_dists = {}
for n_steps in [1, 2, 3, 4, 5]:
    dist = classical_walk(n_steps)
    cl_dists[n_steps] = dist
    print(f'steps={n_steps}: ' + '  '.join(f'P({p})={d:.3f}' for p, d in enumerate(dist)))

def variance(dist):
    positions = np.array([0, 1, 2, 3])
    mean_val = sum(p * d for p, d in zip(positions, dist))
    return sum(d * (p - mean_val)**2 for p, d in zip(positions, dist))

print('\n--- Spread comparison (variance of position) ---')
for n_steps in [1, 2, 3, 4, 5]:
    v_q = variance(qw_dists[n_steps])
    v_c = variance(cl_dists[n_steps])
    print(f'steps={n_steps}: quantum variance={v_q:.3f}  classical variance={v_c:.3f}')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
x = np.arange(4)
w = 0.35
axes[0].bar(x - w/2, qw_dists[3], width=w, label='quantum walk', color='#4C72B0')
axes[0].bar(x + w/2, cl_dists[3], width=w, label='classical walk', color='#C44E52')
axes[0].set_xticks(x); axes[0].set_xlabel('position'); axes[0].set_ylabel('probability')
axes[0].set_title('Position Distribution After 3 Steps'); axes[0].legend()

steps_range = [1,2,3,4,5]
axes[1].plot(steps_range, [variance(qw_dists[s]) for s in steps_range], 'o-', label='quantum')
axes[1].plot(steps_range, [variance(cl_dists[s]) for s in steps_range], 's-', label='classical')
axes[1].set_xlabel('number of steps'); axes[1].set_ylabel('variance of position')
axes[1].set_title('Spreading Rate: Quantum vs Classical Walk'); axes[1].legend()

plt.tight_layout()
plt.savefig('lab30_quantum_walk_full_analysis.png', dpi=150)
plt.show()

print('\nThis is a SAMPLE project only -- your own Experiment 30 submission must be an')
print('original topic (see Section 1 requirements), implemented on real IBM hardware')
print('with a Job ID, and documented per the grading rubric above.')</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 30 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 30:
  Mini-project is the capstone of the M.Sc. Physics quantum computing laboratory sequence. Requirements: (1) genuine original contribution — not reprodu...
  Actual console output for Experiment 30:
  --- Quantum walk position distribution vs step count ---
  steps=1: P(0)=0.000  P(1)=0.000  P(2)=0.499  P(3)=0.501
  steps=2: P(0)=0.254  P(1)=0.489  P(2)=0.257  P(3)=0.000
  steps=3: P(0)=0.124  P(1)=0.128  P(2)=0.126  P(3)=0.622
  steps=4: P(0)=0.120  P(1)=0.617  P(2)=0.131  P(3)=0.131
  steps=5: P(0)=0.126  P(1)=0.129  P(2)=0.126  P(3)=0.619
  --- Spread comparison (variance of position) ---
  steps=1: quantum variance=0.250  classical variance=1.000
  steps=2: quantum variance=0.511  classical variance=1.000
  steps=3: quantum variance=1.186  classical variance=1.000
  steps=4: quantum variance=0.702  classical variance=1.000
  steps=5: quantum variance=1.197  classical variance=1.000
  This is a SAMPLE project only -- your own Experiment 30 submission must be an
  original topic (see Section 1 requirements), implemented on real IBM hardware
  with a Job ID, and documented per the grading rubric above.</pre><img class="fig-img" src="content/images/image23.png"/></div><h2 id="3-observation-and-results-14">3. Observation and Results</h2><h3 id="observation-tables-8">Observation Tables</h3><p><em>Record all experimental data for Experiment 30 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h3 id="ibm-hardware-execution-record-3">IBM Hardware Execution Record</h3><table>
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
</table><h2 id="4-discussion-questions-14">4. Discussion Questions</h2><ol type="1"><li><p>The quantum walk's position distribution after 3 steps was asymmetric even though the coin started in an equal (H) superposition. What does this reveal about the role of interference in quantum walks?</p></li><li><p>Why does the quantum walk's variance not increase smoothly and monotonically with the number of steps, unlike the classical random walk's variance?</p></li><li><p>What would you need to change in this circuit to simulate a quantum walk on a graph with a different topology (e.g. a complete graph or a 2D grid) instead of a simple cycle?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-14">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab30_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Execute on IBM Quantum hardware. Record Job ID immediately after submission.</p></li><li><p>Compare hardware vs simulation results. Calculate error rate and improvement from any mitigation applied.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What makes a good quantum computing research project?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A good project: (1) Novel — addresses a question not already in textbooks. (2) Feasible — ≤10 qubits, ≤50 CX gates for reasonable NISQ fidelity. (3) Measurable — clear quantitative outcomes (fidelity, accuracy, energy error). (4) Connected to theory — implementation demonstrates understanding of quantum principles. (5) Well-documented — commented code, reproducible README, clear figures.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>How should a 15-page technical report be structured?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Structure: Abstract (250 words, p.1). Introduction and Motivation (p.2-3). Theoretical Background (p.4-6). Implementation (p.7-9). Results (p.10-11). Discussion and Error Analysis (p.12-13). Conclusions and Future Work (p.14). References (≥5 peer-reviewed, p.15). Appendix: full code listing. Standards: LaTeX preferred, numbered equations, figures with captions, all quantities with units.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the significance of open-source software in quantum computing?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Open-source frameworks (Qiskit, Cirq, PennyLane) enable: (1) Reproducibility — others can run the same code. (2) Collaboration — community contributions improve frameworks. (3) Education — students learn from research-grade code. (4) Hardware access — cloud APIs allow anyone to run on real quantum hardware. IBM Qiskit: 500,000+ users, 2B+ circuits run. Your project must include a public GitHub repo with MIT license, README with installation instructions.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>How do you plan a quantum experiment for IBM hardware?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Planning: (1) Choose circuit size: ≤10 qubits, ≤50 CX gates. (2) Select best backend: service.least_busy() or check calibration for low CX errors. (3) Read calibration: T₁, T₂, CX error, readout error — estimate expected fidelity. (4) Transpile at level 3. (5) Choose shots: 1024-8192. (6) Apply error mitigation. (7) Record Job ID immediately. (8) Repeat for statistics. (9) Compare with simulation.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What are the most promising near-term quantum applications?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Near-term: (1) Quantum chemistry: VQE for molecular ground states (drug discovery, materials). (2) Combinatorial optimisation: QAOA for logistics, finance, scheduling. (3) Quantum simulation: Ising/Hubbard models (condensed matter). (4) Quantum machine learning: quantum kernels for classification. (5) Quantum cryptography: QKD for secure communication. (6) Financial modelling: quantum Monte Carlo. Most applicable: quantum chemistry (VQE showing utility for 50-100 qubit systems) and Ising simulation (IBM 2023).</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why does a discrete-time quantum walk require an explicit 'coin' qubit, unlike a classical random walk?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The coin qubit provides the source of superposition that drives the walk: without it, there would be no mechanism to move the walker in a superposition of directions simultaneously, which is precisely the quantum feature that produces interference effects absent from any classical random walk.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Why does the quantum walk's probability distribution show interference patterns (peaks and dips) rather than the smooth bell-shaped curve of a classical random walk?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Because the walker's amplitude at each position is a coherent SUM of contributions from many different paths, and these complex amplitudes can constructively or destructively interfere depending on their relative phases, producing a distribution shaped by interference rather than simple probabilistic averaging.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>In what sense does a quantum walk spread 'ballistically' while a classical random walk spreads 'diffusively', and why does this distinction matter for algorithm design?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A classical random walk's standard deviation grows as the square root of the number of steps, while a quantum walk's spreads linearly with the number of steps -- a quadratically faster spreading rate. This same quadratic speedup underlies quantum walk-based search and other quantum walk algorithms that outperform their classical counterparts.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why must a project like this one still be run on real IBM hardware and include a Job ID, even though a simulator already demonstrates the core physics correctly?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The lab's grading rubric and learning objectives specifically require hands-on experience with the practical realities of real quantum hardware -- noise, queueing, calibration drift, and job management -- which a noiseless simulator cannot teach, regardless of how well it reproduces the ideal physics.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What makes a mini-project topic 'novel' in the context of this experiment's grading rubric, given that quantum walks, VQE, and QAOA are all well-established techniques in the literature?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Novelty here refers to combining, extending, or applying an established technique in a way not already covered by Experiments 16-29 of this manual -- such as applying it to a new graph structure, combining it with an error-mitigation or error-correction technique from earlier experiments, or exploring a parameter regime or comparison not already demonstrated.</td></tr>
</tbody>
</table>