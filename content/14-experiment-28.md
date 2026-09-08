<h1 id="exp-28-hardware-aware-circuit-optimisation-and-transpilation">Exp. 28: Hardware-Aware Circuit Optimisation and Transpilation</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>28</strong></p><p>3 hrs</p></td><td><p><strong>Hardware-Aware Circuit Optimisation and Transpilation</strong></p><p>Circuit Transpilation | IBM Hardware Required | Cluster V</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Optimise a 5-qubit GHZ circuit for a specific IBM Quantum backend topology; compare circuit depth and gate count at optimisation levels 0-3; run on hardware and compare fidelities.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-12">1. Background Theory</h2><p>Hardware-Aware Transpilation converts a logical circuit for specific hardware. Steps: (1) Basis gate decomposition: convert to {RZ, SX, X, CX/ECR}. (2) Qubit routing: insert SWAP gates for non-connected qubit pairs. (3) Optimisation: cancel redundant gates, KAK decomposition. Optimisation levels: Level 0 = trivial (deepest, worst fidelity), Level 3 = maximum (KAK decomposition, Clifford simplification, noise-adaptive routing — best fidelity). IBM heavy-hex coupling map: 2D lattice with degree-2 and degree-3 nodes, reduces crosstalk vs square grid. Each SWAP = 3 CX gates, so minimising SWAP count is critical.</p><h2 id="2-qiskit-code-12">2. Qiskit Code</h2><h3 id="first-program-simple-version-12">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 28 — First Program
# Hardware-Aware Circuit Optimisation and Transpilation
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime.fake_provider import FakeBrisbane

backend = FakeBrisbane()
print(f'Backend: {backend.name}, {backend.num_qubits} qubits')

qc = QuantumCircuit(5)
qc.h(0)
for i in range(4):
    qc.cx(i, i + 1)
qc.measure_all()

print(f'\nOriginal circuit: depth={qc.depth()}, gate count={qc.size()}')

for level in [0, 1, 2, 3]:
    tqc = transpile(qc, backend, optimization_level=level, seed_transpiler=42)
    n_swap = tqc.count_ops().get('swap', 0)
    n_cx = sum(tqc.count_ops().get(g, 0) for g in ('cx', 'ecr'))
    print(f'Level {level}: depth={tqc.depth():4d}  gates={tqc.size():4d}  '
          f'2-qubit gates={n_cx:3d}  swaps={n_swap}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Backend: fake_brisbane, 127 qubits

  Original circuit: depth=6, gate count=10
  Level 0: depth=  38  gates=  88  2-qubit gates=  4  swaps=0
  Level 1: depth=  17  gates=  44  2-qubit gates=  4  swaps=0
  Level 2: depth=  15  gates=  35  2-qubit gates=  4  swaps=0
  Level 3: depth=  15  gates=  35  2-qubit gates=  4  swaps=0</code></pre><h3 id="full-program-complete-version-12">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 28: Hardware-Aware Circuit Optimisation and Transpilation
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime.fake_provider import FakeBrisbane
import numpy as np, matplotlib.pyplot as plt

backend = FakeBrisbane()
print(f'Backend: {backend.name}, {backend.num_qubits} qubits')

qc = QuantumCircuit(5)
qc.h(range(5))
for i in range(5):
    for j in range(i + 1, 5):
        qc.cx(i, j)
qc.measure_all()
print(f'Original circuit: depth={qc.depth()}, gates={qc.size()}, '
      f'2-qubit gates={qc.count_ops().get("cx", 0)}')

print('\n--- Optimisation level sweep ---')
results = {}
for level in [0, 1, 2, 3]:
    tqc = transpile(qc, backend, optimization_level=level, seed_transpiler=42)
    n_swap = tqc.count_ops().get('swap', 0)
    n_2q = sum(tqc.count_ops().get(g, 0) for g in ('cx', 'ecr'))
    results[level] = (tqc.depth(), tqc.size(), n_2q, n_swap)
    print(f'Level {level}: depth={tqc.depth():4d}  gates={tqc.size():4d}  '
          f'2-qubit gates={n_2q:3d}  swaps~{n_swap}')

props = backend.properties()
cx_errors = []
for gate in props.gates:
    if gate.gate in ('cx', 'ecr') and len(gate.qubits) == 2:
        err = next((p.value for p in gate.parameters if p.name == 'gate_error'), None)
        if err is not None:
            cx_errors.append((tuple(gate.qubits), err))
cx_errors.sort(key=lambda x: x[1])
print(f'\nBest 5 two-qubit gate error rates on {backend.name}:')
for pair, err in cx_errors[:5]:
    print(f'  qubits {pair}: error={err:.5f}')
print(f'Worst two-qubit gate error rate: {cx_errors[-1][1]:.5f}  (pair {cx_errors[-1][0]})')

readout_errors = [props.readout_error(q) for q in range(backend.num_qubits)]
print(f'\nReadout error: mean={np.mean(readout_errors):.4f}, '
      f'best={min(readout_errors):.4f}, worst={max(readout_errors):.4f}')

best_qubits = sorted(set(q for pair, _ in cx_errors[:6] for q in pair))[:5]
tqc_default = transpile(qc, backend, optimization_level=3, seed_transpiler=1)
tqc_layout = transpile(qc, backend, optimization_level=3, seed_transpiler=1,
                        initial_layout=best_qubits)
print(f'\nDefault layout: depth={tqc_default.depth()}, gates={tqc_default.size()}')
print(f'Best-qubit initial_layout: depth={tqc_layout.depth()}, gates={tqc_layout.size()}')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
levels = [0, 1, 2, 3]
axes[0].plot(levels, [results[l][0] for l in levels], 'o-', label='depth')
axes[0].plot(levels, [results[l][1] for l in levels], 's-', label='gate count')
axes[0].set_xlabel('optimization_level'); axes[0].set_title('Circuit Size vs Optimisation Level')
axes[0].set_xticks(levels); axes[0].legend()

axes[1].hist([e for _, e in cx_errors], bins=25, color='#4C72B0')
axes[1].set_xlabel('Two-qubit gate error rate'); axes[1].set_ylabel('count')
axes[1].set_title(f'{backend.name}: 2-Qubit Gate Error Distribution')

plt.tight_layout()
plt.savefig('lab28_transpilation_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 28 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 28:
  Hardware-Aware Transpilation converts a logical circuit for specific hardware. Steps: (1) Basis gate decomposition: convert to {RZ, SX, X, CX/ECR}. (2...
  Actual console output for Experiment 28:
  Backend: fake_brisbane, 127 qubits
  Original circuit: depth=9, gates=20, 2-qubit gates=10
  --- Optimisation level sweep ---
  Level 0: depth= 166  gates= 412  2-qubit gates= 34  swaps~0
  Level 1: depth=  75  gates= 158  2-qubit gates= 28  swaps~0
  Level 2: depth=  61  gates= 137  2-qubit gates= 18  swaps~0
  Level 3: depth=  62  gates= 138  2-qubit gates= 18  swaps~0
  Best 5 two-qubit gate error rates on fake_brisbane:
    qubits (12, 17): error=0.00366
    qubits (17, 30): error=0.00407
    qubits (11, 12): error=0.00407
    qubits (84, 83): error=0.00430
    qubits (24, 23): error=0.00465
  Readout error: mean=0.0311, best=0.0056, worst=0.2395
  Default layout: depth=63, gates=134
  Best-qubit initial_layout: depth=204, gates=491</pre><img class="fig-img" src="content/images/image20.png"/></div><h2 id="3-observation-and-results-12">3. Observation and Results</h2><h3 id="observation-tables-6">Observation Tables</h3><p><em>Record all experimental data for Experiment 28 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h3 id="ibm-hardware-execution-record-1">IBM Hardware Execution Record</h3><table>
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
</table><h2 id="4-discussion-questions-12">4. Discussion Questions</h2><ol type="1"><li><p>Why did increasing optimization_level from 0 to 1 produce such a large reduction in circuit depth, while going from 2 to 3 produced almost no further improvement?</p></li><li><p>The 'best-qubit' initial_layout (chosen purely by lowest two-qubit gate error) performed WORSE than the default layout in terms of circuit depth. What does this reveal about the limits of choosing qubits by error rate alone?</p></li><li><p>Why does a densely-connected (all-to-all) logical circuit require so much more routing overhead on a sparse heavy-hex hardware topology than a simple linear-chain circuit?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-12">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab28_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Execute on IBM Quantum hardware. Record Job ID immediately after submission.</p></li><li><p>Compare hardware vs simulation results. Calculate error rate and improvement from any mitigation applied.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is quantum circuit transpilation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Transpilation converts a logical circuit (written for ideal all-to-all machine) into a physical circuit for specific hardware. Steps: (1) Unrolling: decompose all gates into basis gates {RZ, SX, X, CX}. (2) Routing: insert SWAP gates to implement CX between non-connected qubits. (3) Scheduling: minimise idle time. (4) Optimisation: cancel redundant gates. Necessary because hardware has limited connectivity and gate set, and error accumulates with every gate.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is the KAK decomposition?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>KAK decomposition: any 2-qubit unitary = (A₁⊗A₂)·exp(-i(x·XX+y·YY+z·ZZ))·(B₁⊗B₂) where A,B are single-qubit unitaries. Requires at most 3 CX gates (optimal). Optimisation Level 3: identify 2-qubit gate sequences composing to a known unitary, apply KAK to reduce CX count. Two CX gates in opposite directions = 0 CX (identity up to single-qubit gates). Drives most impactful depth reductions.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the IBM heavy-hex coupling map?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>IBM heavy-hex: 2D lattice where qubits alternate between degree-2 (edge qubits) and degree-3 (vertex qubits). Advantage: lower ZZ crosstalk vs square grid (fewer neighbours → less unwanted qubit-qubit coupling). Design balances connectivity (for routing) with crosstalk (reduced by fewer neighbours). Supports surface code stabiliser measurements naturally — important for long-term error correction goals.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>How does noise-adaptive routing (level 2) work?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Level 2: uses current calibration data to route qubits to physical locations with lowest error rates. SABRE routing + heuristic preferring CX on qubit pairs with low gate error. Uses backend.properties() for current T₁, T₂, CX errors. Assigns most-used qubits to highest-fidelity physical qubits. Compared to level 1: 10-30% fidelity improvement on heterogeneous hardware where some qubit pairs are significantly better.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>Why is reducing CX count the most impactful optimisation?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>CX gates have ~10-100× higher error rate than single-qubit gates on current hardware (p_CX ≈ 0.1-1% vs p_1q ≈ 0.01-0.1%). A circuit with 10 CX gates has error ≈10×0.005 = 5%, making fidelity ≈95%. Reducing CX count from 12 to 4 (as with level 3 optimisation): fidelity improvement from ~94% to ~98%. SWAP gates (each = 3 CX) are especially costly — avoiding SWAPs via qubit routing is critical.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why does the transpiler need a specific 'coupling map' for the target hardware, rather than just compiling any circuit as written?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Real hardware only supports two-qubit gates between PHYSICALLY CONNECTED qubits (the coupling map); a circuit written with logical two-qubit gates between arbitrary qubit pairs must be adapted, typically via SWAP gate insertion or qubit relabelling, to only use gates the hardware can physically execute.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>What is the practical tradeoff between choosing optimization_level=3 versus a lower level for a large circuit?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Higher optimization levels generally produce shallower, lower-error circuits but require significantly more classical compilation time to search for good gate schedules and layouts; for very large or time-constrained workflows, a lower level may be a pragmatic compromise.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>Why might the SAME logical circuit produce a different transpiled depth on two different real IBM backends, even at the same optimization_level?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Each backend has its own physical qubit topology (coupling map) and its own calibrated gate error rates, so the transpiler's layout and routing decisions -- which are informed by both connectivity and noise-awareness -- will generally produce different results tailored to each specific device.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>What does it mean for a circuit's depth to be a reasonable proxy for its susceptibility to decoherence errors?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Circuit depth roughly corresponds to the number of sequential time-steps the qubits must remain coherent for; since T1/T2 decoherence accumulates with elapsed time, a shallower circuit generally has less opportunity for decoherence to corrupt the computation before it completes.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>Why did choosing qubits purely by their individual two-qubit gate error rate fail to produce a better transpiled circuit in this experiment?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The chosen 'best' qubits were not necessarily well-connected to EACH OTHER on the hardware's coupling map, so even though their local gate fidelities were excellent, the transpiler still had to insert substantial routing overhead (extra SWAPs) to connect them, more than offsetting their fidelity advantage.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>How would you approach picking a good initial_layout in a more principled way than either the default or a pure error-rate ranking?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A better approach would jointly consider both the qubits' individual error rates AND their mutual connectivity/error rates for exactly the two-qubit interactions the circuit actually needs, essentially searching for a connected subgraph of the coupling map that minimises the cumulative error along the specific gate pattern in the circuit.</td></tr>
</tbody>
</table>