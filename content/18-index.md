<h1 id="index-lab-manual-ii">Index — Lab Manual II</h1><table>
<colgroup>
<col style="width: 33%"/><col style="width: 33%"/><col style="width: 33%"/>
</colgroup>
<tbody>
<tr class="odd"><td><strong>Term</strong></td><td><strong>Experiments</strong></td><td><strong>Key Formula / Definition</strong></td></tr>
<tr class="even"><td>Amplitude Damping</td><td>18,25</td><td>K₀=[[1,0],[0,√(1-γ)]] K₁=[[0,√γ],[0,0]] — T₁ relaxation</td></tr>
<tr class="odd"><td>Approximation Ratio</td><td>21</td><td>QAOA_cut/optimal_cut — ≥0.6924 guaranteed p=1 MaxCut on 3-regular graphs</td></tr>
<tr class="even"><td>BB84 Protocol</td><td>27</td><td>QBER≈0% (no Eve), 25% (full Eve), security threshold=11%</td></tr>
<tr class="odd"><td>Barren Plateau</td><td>20,24</td><td>Gradient vanishes exponentially with n — major VQE/QML challenge</td></tr>
<tr class="even"><td>Chemical Accuracy</td><td>20</td><td>|E-E_FCI| &lt; 1.6 mHa (1 kcal/mol) — chemistry benchmark</td></tr>
<tr class="odd"><td>Clifford Group</td><td>17</td><td>Gates mapping Pauli group to itself: H,S,CNOT — classically simulable (Gottesman-Knill)</td></tr>
<tr class="even"><td>Code Distance</td><td>22,23</td><td>d: code corrects ⌊(d-1)/2⌋ errors — Steane d=3, Surface d=O(100)</td></tr>
<tr class="odd"><td>CSS Code</td><td>23</td><td>Calderbank-Shor-Steane: X and Z errors corrected independently</td></tr>
<tr class="even"><td>Gate Folding</td><td>18,29</td><td>U→U·U†·U amplifies noise by 3×; ideal circuit unchanged</td></tr>
<tr class="odd"><td>Gottesman-Knill Theorem</td><td>17</td><td>Clifford circuits classically simulable in O(n²) — enables RB</td></tr>
<tr class="even"><td>Heavy-Hex Coupling Map</td><td>28</td><td>IBM 2D lattice — reduced crosstalk vs square grid</td></tr>
<tr class="odd"><td>IBM Quantum</td><td>16-30</td><td>Cloud hardware; job ID mandatory for all hardware experiments</td></tr>
<tr class="even"><td>Ising Model</td><td>25</td><td>H=-JΣZᵢZᵢ₊₁-hΣXᵢ — quantum phase transition at h/J=1</td></tr>
<tr class="odd"><td>Jordan-Wigner</td><td>20</td><td>Maps fermionic operators to Pauli strings for VQE Hamiltonians</td></tr>
<tr class="even"><td>KAK Decomposition</td><td>28</td><td>Any 2-qubit unitary: ≤3 CX gates (optimal) — key Level 3 optimisation</td></tr>
<tr class="odd"><td>Magic State</td><td>22</td><td>|T⟩=(|0⟩+e^{iπ/4}|1⟩)/√2 — non-Clifford resource for fault-tolerance</td></tr>
<tr class="even"><td>MaxCut</td><td>21</td><td>Graph partition maximising crossing edges — NP-hard; QAOA gives approximation</td></tr>
<tr class="odd"><td>No-Cloning Theorem</td><td>27</td><td>Cannot copy unknown quantum state — QKD security foundation</td></tr>
<tr class="even"><td>Pauli Basis Expansion</td><td>16</td><td>ρ = (1/2ⁿ)Σ_P ⟨P⟩·P — tomographic reconstruction formula</td></tr>
<tr class="odd"><td>QAOA</td><td>21</td><td>p-layer alternating cost/mixer unitaries for combinatorial optimisation</td></tr>
<tr class="even"><td>QPE</td><td>19,26</td><td>O(n ancilla) → n-bit phase estimate; core subroutine of Shor's</td></tr>
<tr class="odd"><td>QBER</td><td>27</td><td>Quantum Bit Error Rate: 25% threshold detects eavesdropping</td></tr>
<tr class="even"><td>Quantum Simulation</td><td>25</td><td>Simulate quantum systems with quantum hardware — Feynman's vision (1982)</td></tr>
<tr class="odd"><td>Randomised Benchmarking</td><td>17</td><td>P(m)=A(1-2p)^m+B; p = error per Clifford gate (SPAM-robust)</td></tr>
<tr class="even"><td>Richardson Extrapolation</td><td>18</td><td>⟨O⟩_ext=(3⟨O⟩₁-⟨O⟩₃)/2 — 2-point ZNE</td></tr>
<tr class="odd"><td>Shor's Algorithm</td><td>19</td><td>O(log³N) factoring — threatens RSA; requires fault-tolerant hardware</td></tr>
<tr class="even"><td>SPAM Error</td><td>17</td><td>State Prep &amp; Measurement error — RB is SPAM-robust (in amplitude A)</td></tr>
<tr class="odd"><td>Stabiliser Code</td><td>22,23</td><td>Code space = +1 eigenspace of all stabiliser generators {Sᵢ}</td></tr>
<tr class="even"><td>Surface Code</td><td>22,23</td><td>[[d²,1,d]] — leading fault-tolerant candidate, threshold ~1%</td></tr>
<tr class="odd"><td>Tomographic Fidelity</td><td>16</td><td>F_tomo = Tr(ρ_ideal·ρ_recon) — 1.0 ideal, &lt;1 with hardware noise</td></tr>
<tr class="even"><td>Transpilation</td><td>28</td><td>Compile circuit for hardware: basis decomposition + qubit routing</td></tr>
<tr class="odd"><td>Trotter Decomposition</td><td>25</td><td>U(t) ≈ (e^{-iH_AΔt}·e^{-iH_BΔt})^N; error O(t·Δt)</td></tr>
<tr class="even"><td>UCCSD Ansatz</td><td>20</td><td>Unitary Coupled Cluster: physically motivated for quantum chemistry VQE</td></tr>
<tr class="odd"><td>VQE</td><td>20</td><td>⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀ — variational principle; hybrid classical-quantum</td></tr>
<tr class="even"><td>ZNE</td><td>18,29</td><td>Zero-Noise Extrapolation: amplify→fit→extrapolate to λ=0</td></tr>
<tr class="odd"><td>ZZFeatureMap</td><td>24</td><td>Quantum feature map encoding classical data via entangled Pauli rotations</td></tr>
</tbody>
</table><figure class="book-figure"><img loading="lazy" src="content/images/image24.png"/></figure>