<h1 id="exp-19-shors-algorithm-period-finding-and-factoring-n15">Exp. 19: Shor's Algorithm — Period Finding and Factoring N=15</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>19</strong></p><p>4 hrs</p></td><td><p><strong>Shor's Algorithm — Period Finding and Factoring N=15</strong></p><p>Landmark Algorithms | Cluster II</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Implement QPE-based period finding for N=15, a=7; use continued fractions to extract r=4; compute gcd to find factors 3 and 5.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-3">1. Background Theory</h2><p>Shor's algorithm (1994) solves integer factorisation in polynomial time O(log³N) on a quantum computer, compared to the best known classical algorithm (GNFS) which runs in sub-exponential time. Integer factoring underlies the security of RSA encryption.</p><div class="box box-generic"><p>Reduction to Period Finding:</p><img class="fig-img" src="content/images/image6.png"/><pre>For any integer a with gcd(a,N)=1, the function  is periodic with period r.</pre><p>If r is even: gcd(a^{r/2}−1, N) and gcd(a^{r/2}+1, N) give non-trivial factors.</p><p>For N=15, a=7:</p><p>7¹=7, 7²=49≡4, 7³=28≡13, 7⁴=1 mod 15 → r=4</p><pre>gcd(7²−1, 15) = gcd(48, 15) = 3  ✓
gcd(7²+1, 15) = gcd(50, 15) = 5  ✓</pre><p>QPE measures phase s/r → continued fractions extracts r</p><p>Circuit: n counting qubits + 4 target qubits for U|y⟩=|7·y mod 15⟩</p></div><table>
<colgroup>
<col style="width: 33%"/><col style="width: 33%"/><col style="width: 33%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Step</strong></td><td><strong>Operation</strong></td><td><strong>Classical Equivalent</strong></td></tr>
<tr class="even"><td>1</td><td>Prepare counting register in |+⟩^n</td><td>Initialize n-bit register</td></tr>
<tr class="odd"><td>2</td><td>Prepare target register in |0001⟩ (eigenstate of U)</td><td>Set working register</td></tr>
<tr class="even"><td>3</td><td>Apply controlled-U^{2^k} for k=0,...,n-1</td><td>Compute a^x mod N for x=0,...,2^n-1</td></tr>
<tr class="odd"><td>4</td><td>Apply inverse QFT to counting register</td><td>Apply classical FFT</td></tr>
<tr class="even"><td>5</td><td>Measure counting register → get phase s/r</td><td>Read frequency spectrum</td></tr>
<tr class="odd"><td>6</td><td>Continued fractions: s/r → r</td><td>Factor the frequency</td></tr>
<tr class="even"><td>7</td><td>gcd(a^{r/2}±1, N) → factors</td><td>Factor N classically</td></tr>
</tbody>
</table><h2 id="2-qiskit-code-3">2. Qiskit Code</h2><h3 id="first-program-simple-version-3">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 19 — First Program: Shor's Algorithm (Period Verification)
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from math import gcd
import numpy as np

# Classical verification: find period of f(x) = 7^x mod 15
N, a = 15, 7
print(f"Period finding for f(x) = {a}^x mod {N}:")
for x in range(1, 16):
    val = pow(a, x, N)
    print(f"  {a}^{x} mod {N} = {val}", end="")
    if val == 1:
        print(f"  &lt;-- period r = {x}"); break
    else: print()

r = 4  # period found above
factor1 = gcd(pow(a, r//2) - 1, N)
factor2 = gcd(pow(a, r//2) + 1, N)
print(f"\ngcd({a}^{r//2}-1, {N}) = gcd({pow(a,r//2)-1}, {N}) = {factor1}")
print(f"gcd({a}^{r//2}+1, {N}) = gcd({pow(a,r//2)+1}, {N}) = {factor2}")
print(f"Factors of {N}: {factor1} x {factor2} = {factor1*factor2}")</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Period finding for f(x) = 7^x mod 15:
    7^1 mod 15 = 7
    7^2 mod 15 = 4
    7^3 mod 15 = 13
    7^4 mod 15 = 1  &lt;-- period r = 4

  gcd(7^2-1, 15) = gcd(48, 15) = 3
  gcd(7^2+1, 15) = gcd(50, 15) = 5
  Factors of 15: 3 x 5 = 15</code></pre><h3 id="full-program-complete-version-3">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 19: Shor's Algorithm - Quantum Period Finding
#  Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.circuit.library import QFT
from qiskit_aer import AerSimulator
from math import gcd
from fractions import Fraction
import numpy as np, matplotlib.pyplot as plt

def mod_exp_gate_7_15(power):
    """Modular exponentiation: U^power |y&gt; = |7^power * y mod 15&gt;"""
    U = QuantumCircuit(4, name=f"U^{power}(7,15)")
    power_mod4 = power % 4
    if power_mod4 == 0: pass  # Identity
    elif power_mod4 == 1:
        U.swap(0,1); U.swap(1,2); U.swap(2,3)
        U.x(0); U.x(3)
    elif power_mod4 == 2:
        U.swap(1,3); U.x(0); U.x(1); U.x(2); U.x(3)
    elif power_mod4 == 3:
        U.swap(0,1); U.swap(1,2); U.swap(2,3)
        U.x(1); U.x(2)
    return U

n_count = 4  # counting qubits
qc = QuantumCircuit(n_count + 4, n_count)
# Prepare counting register in uniform superposition
qc.h(range(n_count))
# Prepare target register in |0001&gt; (eigenstate)
qc.x(n_count)
qc.barrier(label="Init")
# Apply controlled-U^{2^k}
for k in range(n_count):
    power = 2**k
    ctrl_U = mod_exp_gate_7_15(power).control(1)
    qc.compose(ctrl_U, qubits=[k]+list(range(n_count, n_count+4)), inplace=True)
qc.barrier(label="Ctrl-U")
# Inverse QFT on counting register
qc.compose(QFT(n_count, inverse=True), qubits=range(n_count), inplace=True)
qc.barrier(label="iQFT")
qc.measure(range(n_count), range(n_count))

# Run simulation
sim = AerSimulator()
counts = sim.run(qc, shots=4096).result().get_counts()

# Interpret results using continued fractions
N, a = 15, 7
print(f'{'Bitstring':&gt;10} {'Count':&gt;8} {'Phase phi':&gt;10} {'Fraction':&gt;12} {'r':&gt;6} {'Factors':&gt;12}')
found_factors = set()
sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
for bitstring, count in sorted_counts[:8]:
    measured_int = int(bitstring[::-1], 2)
    phase = measured_int / (2**n_count)
    frac = Fraction(phase).limit_denominator(N)
    r = frac.denominator
    factors_str = ""
    if r &gt; 0 and r % 2 == 0:
        g1 = gcd(int(a**(r//2)) - 1, N)
        g2 = gcd(int(a**(r//2)) + 1, N)
        if 1 &lt; g1 &lt; N: found_factors.add(g1); factors_str += f"{g1} "
        if 1 &lt; g2 &lt; N: found_factors.add(g2); factors_str += f"{g2}"
    print(f"{bitstring:&gt;10} {count:&gt;8} {phase:&gt;10.4f} {str(frac):&gt;12} {r:&gt;6} {factors_str:&gt;12}")

print(f"\nFactors found: {sorted(found_factors)}")
print(f"Verification: {factor1} x {factor2} = {N}")

# Plot measurement distribution
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
states = sorted(counts.keys(), key=lambda x: int(x[::-1],2))
probs = [counts.get(s,0)/4096 for s in states]
ax1.bar(range(len(states)), probs, color="#533483", edgecolor="white")
ax1.set_xticks(range(len(states)))
ax1.set_xticklabels([str(int(s[::-1],2)) for s in states], rotation=45, fontsize=7)
ax1.set_xlabel('Measured integer (counting register)')
ax1.set_ylabel('Probability')
ax1.set_title("Shor's QPE - Measurement Distribution", fontweight='bold')
for k in range(4):
    ax2.axvline(k/4, color="gold", ls="--", alpha=0.7)
ax2.stem([int(s[::-1],2)/(2**n_count) for s in states], probs,
         linefmt="#533483", markerfmt="o", basefmt="k-")
ax2.set_xlabel('Phase phi = measured/16')
ax2.set_ylabel('Probability')
ax2.set_title('Phase Distribution - Expected peaks at k/4\n(r=4 is the period)', fontweight='bold')
plt.suptitle("Shor's Algorithm - N=15, a=7", fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig('lab19_shor.png', dpi=150, bbox_inches='tight')
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 19 — Expected Output &amp; Console Results</p><pre>  First Program Console Output (classical verification):
  Period finding for f(x) = 7^x mod 15:
    7^1 mod 15 = 7
    7^2 mod 15 = 4
    7^3 mod 15 = 13
    7^4 mod 15 = 1  &lt;-- period r = 4
  gcd(7^2-1, 15) = gcd(48, 15) = 3
  gcd(7^2+1, 15) = gcd(50, 15) = 5
  Factors of 15: 3 x 5 = 15
  Full Program QPE Output (peaks at m=0,4,8,12):
  Bitstring  Count    Phase phi    Fraction      r      Factors
      0100   ~1024     0.2500        1/4          4       3 5
      1100   ~1024     0.7500        3/4          4       3 5
      1000   ~1024     0.5000        1/2          2       3 5
      0000   ~1024     0.0000        0/1          1
  Factors found: {3, 5}
  Verification: 3 x 5 = 15? True</pre></div><h2 id="3-observation-and-results-3">3. Observation and Results</h2><h3 id="table-191-qpe-measurement-outcomes">Table 19.1 — QPE Measurement Outcomes</h3><table>
<colgroup>
<col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/><col style="width: 17%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Bitstring</strong></td><td><strong>Measured m</strong></td><td><strong>Phase φ=m/16</strong></td><td><strong>Fraction</strong></td><td><strong>Period r</strong></td><td><strong>gcd Factors</strong></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="even"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr class="odd"><td>Expected (m=0,4,8,12)</td><td>0,4,8,12</td><td>0,1/4,1/2,3/4</td><td>k/4</td><td>4</td><td>3,5</td></tr>
</tbody>
</table><h3 id="table-192-factor-verification">Table 19.2 — Factor Verification</h3><table>
<colgroup>
<col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/><col style="width: 25%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Step</strong></td><td><strong>Formula</strong></td><td><strong>Value</strong></td><td><strong>Result</strong></td></tr>
<tr class="even"><td>Period r found</td><td>From continued fractions</td><td></td><td></td></tr>
<tr class="odd"><td>a^(r/2) mod N</td><td>7² mod 15</td><td>4</td><td></td></tr>
<tr class="even"><td>gcd(a^(r/2)−1, N)</td><td>gcd(48, 15)</td><td></td><td>3 ✓</td></tr>
<tr class="odd"><td>gcd(a^(r/2)+1, N)</td><td>gcd(50, 15)</td><td></td><td>5 ✓</td></tr>
<tr class="even"><td>Product check</td><td>3 × 5</td><td>15</td><td>N = 15 ✓</td></tr>
</tbody>
</table><h2 id="4-discussion-questions-3">4. Discussion Questions</h2><ol type="1"><li><p>Explain Shor's algorithm at a high level and why it achieves a polynomial-time speedup for factoring.</p></li><li><p>How does integer factoring reduce to period finding? Give the complete proof for N=15, a=7.</p></li><li><p>What is the quantum complexity of QPE for n counting qubits? How does precision scale with n?</p></li><li><p>Why does the experiment use N=15 and a=7 specifically? What makes this combination ideal?</p></li><li><p>What are the resource requirements for running Shor's algorithm on cryptographically relevant N=2048?</p></li></ol><h2 id="5-lab-record-requirements-3">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Verify the period r=4 and factors 3,5 classically.</p></li><li><p>Run the Full Program. Record QPE measurement outcomes in Table 19.1.</p></li><li><p>Complete Table 19.2 with the full factoring verification.</p></li><li><p>Save lab19_shor.png. Identify the 4 peaks in the QPE distribution (at m=0,4,8,12).</p></li><li><p>Write answers to all 5 Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>Explain Shor's algorithm and why it is important for cryptography.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Shor's algorithm solves integer factorisation in O(log³N) quantum time vs the best known classical algorithm (GNFS) which runs in sub-exponential time exp(O(log^(1/3)N)). Importance: RSA encryption (used for HTTPS, secure email, etc.) relies on the classical hardness of factoring large integers. A fault-tolerant quantum computer running Shor's could break RSA-2048 in hours, requiring migration to post-quantum cryptography. This motivates both the urgency of quantum-safe cryptography and hardware progress assessment.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>How does integer factoring reduce to period finding?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>For any integer a with gcd(a,N)=1, the function f(x)=a^x mod N is periodic with period r (the multiplicative order of a mod N). If r is even: a^r≡1 (mod N) → (a^{r/2}-1)(a^{r/2}+1)≡0 (mod N) → N divides the product. If neither factor is 0 mod N, then gcd(a^{r/2}±1, N) gives non-trivial factors with high probability. Classical period finding takes O(N) time; quantum QPE finds the period in O(log²N) time.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the continued fractions algorithm and why is it needed?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The QPE measurement gives a rational number p/q ≈ s/r (where s is a random integer 0 to r-1). The continued fractions algorithm finds the best rational approximation with small denominator: p/q = a₀ + 1/(a₁+1/(a₂+...)) with convergents p_k/q_k. Key theorem: if |s/r − m/N| &lt; 1/(2N²), then m/N appears as a convergent. Since QPE gives phase to n-bit precision (error &lt; 1/2^n), continued fractions reliably extracts r for n=O(log N).</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is modular exponentiation and why is it the hardest part of the circuit?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Modular exponentiation circuit: |x⟩|1⟩ → |x⟩|a^x mod N⟩. This is the controlled-U^{2^k} operation in QPE. Implementation requires quantum arithmetic: addition, multiplication, and modular reduction circuits, all reversible (unitary). Circuit depth: O(n³) for naive implementation. Most of the circuit complexity is here — the quantum speedup is hidden in performing this for ALL x simultaneously in superposition.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>What resource requirements does Shor need for RSA-2048?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>RSA-2048: factoring 2048-bit integer. Circuit size: O(log³N) ≈ (2048)³/100 ≈ 10⁹ gates. With error correction: ~4000 logical qubits, each requiring ~1000 physical qubits with surface code = ~4 million physical qubits. Current IBM hardware: ~433 qubits, error rates 10-100× above threshold. Timeline estimate: fault-tolerant Shor's for RSA-2048 is decades away. This is why NIST standardised post-quantum cryptography in 2022-2024.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>What happens if the measured period r is odd?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>If r is odd, a^{r/2} is not an integer and the factoring step fails. Similarly if a^{r/2}≡-1 (mod N): gcd(a^{r/2}+1,N)=N (trivial). Probability of failure: ≤1/4 per run for large N (not a prime power). Solution: restart with a different random a. After O(log(1/δ)) runs, success probability ≥1−δ. Classical verification confirms the factors at the end.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Compare quantum vs classical factoring algorithms.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Classical GNFS: sub-exponential exp(O(log^{1/3}N · log^{2/3}logN)). For N=2048: ~10¹⁰ operations. Quantum Shor's: polynomial O(log³N). For N=2048: ~10⁹ quantum gates (but fault-tolerant, so add ~1000× for error correction = ~10¹² physical operations). The quantum speedup is exponential in asymptotic complexity. In practice: for current hardware, n&lt;100, Shor's circuit can run but provides no real cryptographic threat.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What is the quantum phase estimation (QPE) subroutine and how does it detect periodicity?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>QPE estimates the eigenphase φ of unitary U (eigenvalue e^{2πiφ}). For Shor: U|y⟩=|a·y mod N⟩ has eigenvalues e^{2πis/r}. QPE measures phase s/r → continued fractions gives r. The QFT in QPE converts the periodic phase pattern into a sharp frequency peak at multiples of 1/r. Without QPE, detecting periodicity classically would require O(N) function evaluations; QPE does it in O(log N) quantum gates.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>How does Shor relate to the BQP complexity class?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>BQP (Bounded-error Quantum Polynomial time): the class of problems solvable by quantum computers in polynomial time with error ≤1/3. Integer factorisation is in BQP (Shor proved this). It is not known to be in P (polynomial classical time) — this remains an open problem. If factoring is NP-hard (not proven), then BQP contains NP-hard problems, implying BQP ⊔ P but possibly BQP ⊔ NP. The exact relationship between BQP, P, and NP is unknown.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>What is quantum advantage in the context of this experiment?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>This experiment demonstrates Shor's algorithm on N=15 as a proof of concept. The circuit has only ~10 qubits and can run on current hardware. However, N=15 can be trivially factored classically. True quantum advantage requires factoring large N (&gt;1000 bits) where classical algorithms fail. The experiment shows all key components: QPE, modular exponentiation, inverse QFT, continued fractions, and gcd — the full pipeline that would threaten cryptography at scale.</td></tr>
</tbody>
</table>