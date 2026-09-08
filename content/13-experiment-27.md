<h1 id="exp-27-bb84-qkd-protocol-eavesdropping-security-analysis">Exp. 27: BB84 QKD Protocol — Eavesdropping Security Analysis</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>27</strong></p><p>3 hrs</p></td><td><p><strong>BB84 QKD Protocol — Eavesdropping Security Analysis</strong></p><p>Quantum Cryptography | Cluster V</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Implement the complete BB84 quantum key distribution protocol with n=200 bits; simulate an intercept-resend eavesdropping attack; measure QBER; compute the secure key rate.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-11">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image18.png"/></figure><p>BB84 Protocol: (1) Alice prepares random qubits {|0⟩,|1⟩,|+⟩,|−⟩}, (2) Bob measures in random bases, (3) Sifting: keep bits where B_A=B_B (~50%), (4) Error estimation: compute QBER from sample comparison, (5) Privacy amplification: hash to eliminate Eve's information. Security: QBER≈0-3% (no Eve), ~25% (full intercept-resend Eve), security threshold=11%. Secure key rate:  where h is binary entropy. Security relies on no-cloning theorem — Eve cannot copy qubits without disturbing them.</p><h2 id="2-qiskit-code-11">2. Qiskit Code</h2><h3 id="first-program-simple-version-11">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 27 — First Program
# BB84 QKD Protocol — Eavesdropping Security Analysis
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np

rng = np.random.default_rng(1)
n_bits = 200
sim = AerSimulator()

alice_bits = rng.integers(0, 2, n_bits)
alice_bases = rng.integers(0, 2, n_bits)
bob_bases = rng.integers(0, 2, n_bits)
bob_bits = np.zeros(n_bits, dtype=int)

for i in range(n_bits):
    qc = QuantumCircuit(1, 1)
    if alice_bits[i] == 1:
        qc.x(0)
    if alice_bases[i] == 1:
        qc.h(0)
    if bob_bases[i] == 1:
        qc.h(0)
    qc.measure(0, 0)
    result = sim.run(qc, shots=1, memory=True).result()
    bob_bits[i] = int(result.get_memory()[0])

sift_mask = alice_bases == bob_bases
alice_key = alice_bits[sift_mask]
bob_key = bob_bits[sift_mask]
qber = np.mean(alice_key != bob_key)

print(f'Total qubits sent: {n_bits}')
print(f'Sifted key length: {sift_mask.sum()} ({sift_mask.sum()/n_bits*100:.1f}% -- expect ~50%)')
print(f'Quantum Bit Error Rate (QBER): {qber*100:.2f}%  (expect ~0% with no eavesdropper)')
print(f'Keys match: {np.array_equal(alice_key, bob_key)}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Total qubits sent: 200
  Sifted key length: 115 (57.5% -- expect ~50%)
  Quantum Bit Error Rate (QBER): 0.00%  (expect ~0% with no eavesdropper)
  Keys match: True</code></pre><h3 id="full-program-complete-version-11">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 27: BB84 QKD Protocol — Eavesdropping Security Analysis
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np, matplotlib.pyplot as plt

sim = AerSimulator()

def run_bb84(n_bits, eve_intercept_prob, rng):
    alice_bits = rng.integers(0, 2, n_bits)
    alice_bases = rng.integers(0, 2, n_bits)
    bob_bases = rng.integers(0, 2, n_bits)
    eve_intercepts = rng.random(n_bits) &lt; eve_intercept_prob
    eve_bases = rng.integers(0, 2, n_bits)
    bob_bits = np.zeros(n_bits, dtype=int)

    for i in range(n_bits):
        qc = QuantumCircuit(1, 1)
        if alice_bits[i] == 1:
            qc.x(0)
        if alice_bases[i] == 1:
            qc.h(0)
        if eve_intercepts[i]:
            if eve_bases[i] == 1:
                qc.h(0)
            qc.measure(0, 0)
            if eve_bases[i] == 1:
                qc.h(0)
        if bob_bases[i] == 1:
            qc.h(0)
        qc.measure(0, 0)
        result = sim.run(qc, shots=1, memory=True).result()
        bob_bits[i] = int(result.get_memory()[0][-1])

    sift_mask = alice_bases == bob_bases
    alice_key, bob_key = alice_bits[sift_mask], bob_bits[sift_mask]
    qber = np.mean(alice_key != bob_key) if len(alice_key) else 0.0
    return qber, sift_mask.sum()

rng = np.random.default_rng(2)
n_bits = 300

print('--- QBER vs Eve intercept-resend probability ---')
probs = [0.0, 0.25, 0.5, 0.75, 1.0]
qbers = []
for p in probs:
    qber, keylen = run_bb84(n_bits, p, rng)
    qbers.append(qber)
    print(f'Eve intercept prob={p:.2f}: QBER={qber*100:.2f}%  (sifted key length={keylen})')

def binary_entropy(p):
    if p &lt;= 0 or p &gt;= 1:
        return 0.0
    return -p*np.log2(p) - (1-p)*np.log2(1-p)

print('\n--- Secure key rate bound r &gt;= 1 - 2*h(QBER) ---')
for p, qber in zip(probs, qbers):
    r = 1 - 2*binary_entropy(qber)
    secure = 'SECURE' if qber &lt; 0.11 else 'INSECURE (abort)'
    print(f'Eve prob={p:.2f}: QBER={qber*100:.1f}%  key rate bound r={max(r,0):.3f}  -&gt; {secure}')

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].plot(probs, [q*100 for q in qbers], 'o-', color='#C44E52')
axes[0].axhline(11, color='black', linestyle='--', label='11% security threshold')
axes[0].set_xlabel("Eve's intercept probability"); axes[0].set_ylabel('QBER (%)')
axes[0].set_title('BB84: QBER vs Eavesdropping Intensity'); axes[0].legend()

rates = [max(1-2*binary_entropy(q), 0) for q in qbers]
axes[1].bar([f'{int(p*100)}%' for p in probs], rates, color='#4C72B0')
axes[1].set_xlabel("Eve's intercept probability"); axes[1].set_ylabel('Secure key rate bound r')
axes[1].set_title('Secure Key Rate vs Eavesdropping')

plt.tight_layout()
plt.savefig('lab27_bb84_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 27 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 27:
  BB84 Protocol: (1) Alice prepares random qubits {|0⟩,|1⟩,|+⟩,|−⟩}, (2) Bob measures in random bases, (3) Sifting: keep bits where B_A=B_B (~50%), (4) ...
  Actual console output for Experiment 27:
  --- QBER vs Eve intercept-resend probability ---
  Eve intercept prob=0.00: QBER=0.00%  (sifted key length=158)
  Eve intercept prob=0.25: QBER=8.82%  (sifted key length=136)
  Eve intercept prob=0.50: QBER=10.85%  (sifted key length=129)
  Eve intercept prob=0.75: QBER=11.04%  (sifted key length=154)
  Eve intercept prob=1.00: QBER=25.90%  (sifted key length=166)
  --- Secure key rate bound r &gt;= 1 - 2*h(QBER) ---
  Eve prob=0.00: QBER=0.0%  key rate bound r=1.000  -&gt; SECURE
  Eve prob=0.25: QBER=8.8%  key rate bound r=0.139  -&gt; SECURE
  Eve prob=0.50: QBER=10.9%  key rate bound r=0.009  -&gt; SECURE
  Eve prob=0.75: QBER=11.0%  key rate bound r=0.000  -&gt; INSECURE (abort)
  Eve prob=1.00: QBER=25.9%  key rate bound r=0.000  -&gt; INSECURE (abort)</pre><img class="fig-img" src="content/images/image19.png"/></div><h2 id="3-observation-and-results-11">3. Observation and Results</h2><h3 id="observation-tables-5">Observation Tables</h3><p><em>Record all experimental data for Experiment 27 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h2 id="4-discussion-questions-11">4. Discussion Questions</h2><ol type="1"><li><p>Why does the sifting step (keeping only bits where Alice's and Bob's bases matched) discard on average half of the transmitted qubits, and why is this an acceptable cost for a security protocol?</p></li><li><p>Explain why an eavesdropper using intercept-resend cannot avoid introducing errors, even in principle, and connect this to the no-cloning theorem.</p></li><li><p>The measured QBER crossed the 11% security threshold well before Eve intercepted 100% of the qubits. What does this tell you about how sensitive BB84 is to partial eavesdropping?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-11">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab27_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>Explain the BB84 protocol step by step.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Step 1: Alice generates random bits b_A and bases B_A ∈ {Z,X}. Prepares qubits: Z-basis 0→|0⟩, 1→|1⟩; X-basis 0→|+⟩, 1→|−⟩. Step 2: Sends qubits to Bob. Step 3: Bob measures in random bases B_B. Step 4: Basis reconciliation via classical channel (announce bases, not bits). Step 5: Sifted key = bits where B_A=B_B. Step 6: Error estimation: compare sample → QBER. Step 7: Privacy amplification: hash sifted key to remove Eve's information.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>Prove Eve introduces exactly 25% QBER with intercept-resend.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Eve intercepts each qubit and measures in random basis B_E (Z or X, prob 1/2 each). Case 1 (B_E=B_A, prob 1/2): Eve measures correctly, re-prepares correctly → no error. Case 2 (B_E≠B_A, prob 1/2): Eve wrong basis, result random. When Bob measures in B_B=B_A (correct basis), Eve's wrong-basis re-preparation gives 50% error. P(error) = (1/2)·0 + (1/2)·(1/2) = 1/4 = 25%.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>Why is no-cloning essential for QKD security?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Without no-cloning, Eve could copy qubits, keep copies undetected, measure later after knowing the basis. No-cloning ensures any interception disturbs the quantum states (detected by QBER elevation). QKD security is information-theoretically guaranteed — secure even against computationally unlimited adversaries. This is fundamentally different from RSA: no amount of computing power can break QKD if QBER &lt; 11%.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is privacy amplification?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>After sifting and error correction: sifted key of length n_sift with QBER q. Privacy amplification: apply universal hash H: {0,1}^{n_sift} → {0,1}^k. Leftover hash lemma: output key of length k = n_sift·(1-2h(q)) - leak is information-theoretically secure. At q=11%: k→0 (all information eliminated). Below threshold: secure key extracted. This step ensures Eve has negligible information about the final key even if she learned some bits during transmission.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What are the practical challenges of QKD?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>(1) Distance: photon loss limits range to ~100 km; quantum repeaters needed for longer. (2) Key rate: kbps-Mbps, much slower than classical keys. (3) Authentication: requires pre-shared authentication key. (4) Hardware security: side-channel attacks can break practical devices (e.g. detector blinding). (5) Cost: single-photon sources and detectors are expensive. Solutions: satellite QKD (China Micius: 1200 km), twin-field QKD (increased range), device-independent QKD.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why is a fresh random basis chosen independently for each qubit, rather than Alice and Bob agreeing on a basis pattern in advance?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>If the basis pattern were predictable or agreed upon classically in advance, an eavesdropper could learn or guess it too, allowing her to measure in the correct basis every time without introducing any detectable disturbance -- defeating the security of the protocol.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Why does an eavesdropper's intercept-resend attack necessarily disturb the qubits when her guessed basis is wrong?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Measuring a qubit in the wrong basis collapses it into a state that is an equal superposition in the ORIGINAL basis; when Eve re-sends this state and Bob measures in the original (correct) basis, he gets a uniformly random outcome, which disagrees with Alice's original bit 50% of the time.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What role does the classical channel play in BB84, and why doesn't it need to be secret (only authenticated)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The classical channel is used to compare basis choices (sifting) and perform error-rate estimation; since Eve is assumed to be able to listen to any classical communication anyway, revealing basis choices publicly doesn't leak the actual bit values, only which measurements are comparable. Authentication (not secrecy) is required so Eve cannot impersonate Alice or Bob.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why is 11% often cited as an approximate security threshold for the QBER in BB84?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Above roughly 11% QBER, standard privacy amplification and error correction procedures can no longer guarantee that any information Eve may have gained can be fully removed from the final key while still leaving a positive net key rate, per the r&gt;=1-2h(QBER) bound; below this threshold, secure key extraction remains theoretically possible.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>How would using more than 2 measurement bases (rather than just Z and X) affect the protocol's security or efficiency?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Additional bases can, in some protocol variants, make certain eavesdropping strategies less effective or provide more information for error estimation, but they also reduce the fraction of instances where Alice's and Bob's bases match by chance, lowering the sifting efficiency and the raw key generation rate.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>Why can't Eve simply copy each qubit and measure her copy later without disturbing the original?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>This is precisely what the no-cloning theorem forbids: there is no physical process that can create an identical copy of an arbitrary unknown quantum state, so Eve is fundamentally unable to duplicate Alice's qubits for later analysis without directly interacting with (and thus disturbing) them.</td></tr>
</tbody>
</table>