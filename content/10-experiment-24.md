<h1 id="exp-24-quantum-machine-learning-binary-classifier">Exp. 24: Quantum Machine Learning — Binary Classifier</h1><table>
<colgroup>
<col style="width: 12%"/>
<col style="width: 87%"/>
</colgroup>
<tbody>
<tr class="odd"><td><p><strong>EXP</strong></p><p><strong>24</strong></p><p>4 hrs</p></td><td><p><strong>Quantum Machine Learning — Binary Classifier</strong></p><p>QML | Cluster IV</p></td></tr>
<tr class="even"><td><strong>AIM</strong></td><td>Train a variational quantum classifier using the ZZFeatureMap to classify a 2D Iris dataset; compare quantum SVM accuracy with classical SVM; analyse the decision boundary.</td></tr>
<tr class="odd"><td><strong>Course</strong></td><td>Advanced Quantum Computing Laboratory</td></tr>
</tbody>
</table><h2 id="1-background-theory-8">1. Background Theory</h2><figure class="book-figure"><img loading="lazy" src="content/images/image13.png"/></figure><p>Quantum feature map Φ(x): ZZFeatureMap encodes classical data x into quantum state |Φ(x)⟩ with ZZ interactions. Quantum kernel: . Variational ansatz U(θ): RealAmplitudes (Ry+CX layers). Measurement: ⟨Z⟩ on qubit 0, threshold at 0 for binary decision (+1/-1). Training: COBYLA minimises cross-entropy loss. Dataset: Iris (2-class, 2 features: sepal length/width, scaled to [0,π]). Expected: quantum accuracy 80-90%, classical SVM (RBF) accuracy 95%+. Training time: quantum &gt;&gt; classical (each evaluation requires quantum circuit execution).</p><h2 id="2-qiskit-code-8">2. Qiskit Code</h2><h3 id="first-program-simple-version-8">First Program (Simple Version)</h3><p>This concise program captures the essential logic. Run this first to verify the core concept.</p><pre><code class="language-python"># Experiment 24 — First Program
# Quantum Machine Learning — Binary Classifier
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
from qiskit import QuantumCircuit, transpile
from qiskit.circuit.library import zz_feature_map, real_amplitudes
from qiskit_aer import AerSimulator
import numpy as np
from sklearn.datasets import load_iris

data = load_iris()
X = data.data[:100, :2]
y = data.target[:100]
X_scaled = (X - X.min(0)) / (X.max(0) - X.min(0)) * np.pi

feature_map = zz_feature_map(feature_dimension=2, reps=1)
ansatz = real_amplitudes(num_qubits=2, reps=1)
theta0 = np.random.default_rng(42).uniform(0, 2*np.pi, ansatz.num_parameters)
sim = AerSimulator()

def predict(x, theta):
    qc = QuantumCircuit(2, 1)
    qc.compose(feature_map.assign_parameters(x), inplace=True)
    qc.compose(ansatz.assign_parameters(theta), inplace=True)
    qc.measure(0, 0)
    counts = sim.run(transpile(qc, sim), shots=512).result().get_counts()
    return 1 if counts.get('0', 0) / 512 &gt; 0.5 else 0

sample_idx = [0, 25, 50, 75]
print('Sample predictions (untrained ansatz, random theta):')
for i in sample_idx:
    pred = predict(X_scaled[i], theta0)
    print(f'  sample {i}: true label={y[i]}  predicted={pred}  features={X[i]}')</code></pre><p><strong>Expected Output:</strong></p><pre><code>Console Output (Simple Version):
  Sample predictions (untrained ansatz, random theta):
    sample 0: true label=0  predicted=0  features=[5.1 3.5]
    sample 25: true label=0  predicted=0  features=[5. 3.]
    sample 50: true label=1  predicted=1  features=[7.  3.2]
    sample 75: true label=1  predicted=0  features=[6.6 3. ]</code></pre><h3 id="full-program-complete-version-8">Full Program (Complete Version)</h3><p>This comprehensive program includes complete analysis, multi-panel visualisations, and full output generation.</p><pre><code class="language-python"># ───────────────────────────────────────────────────────────────────────
# Experiment 24: Quantum Machine Learning — Binary Classifier
# Dr. S. K. Jain, Associate Professor, Invertis University, U.P. (India)
# ───────────────────────────────────────────────────────────────────────
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.circuit.library import zz_feature_map, real_amplitudes
import numpy as np, matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from scipy.optimize import minimize

data = load_iris()
X = data.data[:100, :2]
y = data.target[:100]
X_scaled = (X - X.min(0)) / (X.max(0) - X.min(0)) * np.pi
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=42)
Xr_train, Xr_test, yr_train, yr_test = train_test_split(X, y, test_size=0.3, random_state=42)

feature_map = zz_feature_map(feature_dimension=2, reps=1)
ansatz = real_amplitudes(num_qubits=2, reps=2)

def p0_exact(x, theta):
    qc = QuantumCircuit(2)
    qc.compose(feature_map.assign_parameters(x), inplace=True)
    qc.compose(ansatz.assign_parameters(theta), inplace=True)
    return Statevector(qc).probabilities([0])[0]

def loss(theta, X, y):
    eps = 1e-9
    total = sum(-np.log((p0_exact(x, theta) if lb == 0 else 1 - p0_exact(x, theta)) + eps)
                for x, lb in zip(X, y))
    return total / len(X)

rng = np.random.default_rng(2)
best_theta, best_acc = None, -1
for _ in range(200):
    theta = rng.uniform(0, 2*np.pi, ansatz.num_parameters)
    preds = [1 if p0_exact(x, theta) &lt; 0.5 else 0 for x in X_train]
    acc = accuracy_score(y_train, preds)
    if acc &gt; best_acc:
        best_acc, best_theta = acc, theta

res = minimize(loss, best_theta, args=(X_train, y_train), method='COBYLA', options={'maxiter': 80})

def predict(x, theta):
    return 1 if p0_exact(x, theta) &lt; 0.5 else 0

polished_train_acc = accuracy_score(y_train, [predict(x, res.x) for x in X_train])
theta_opt = res.x if polished_train_acc &gt;= best_acc else best_theta
train_acc = accuracy_score(y_train, [predict(x, theta_opt) for x in X_train])
test_acc = accuracy_score(y_test, [predict(x, theta_opt) for x in X_test])
print(f'Multi-start warm-up best training accuracy: {best_acc:.3f}')
print(f'Quantum classifier (after COBYLA polish): train={train_acc:.3f}  test={test_acc:.3f}')

svm = SVC(kernel='rbf').fit(Xr_train, yr_train)
svm_acc = accuracy_score(yr_test, svm.predict(Xr_test))
print(f'Classical SVM (RBF) baseline: test={svm_acc:.3f}')
print()
print('Note: shallow (2-qubit) variational classifiers are notoriously hard to train')
print('with derivative-free optimisers like COBYLA -- the loss landscape has many flat')
print('regions and local minima. Multi-start random search followed by local polishing')
print('is a standard practical workaround, though quantum accuracy typically still')
print('trails a classical SVM baseline on this small a circuit.')

fig, axes = plt.subplots(1, 2, figsize=(11, 5))
h = .05
xx, yy = np.meshgrid(np.arange(0, np.pi, h), np.arange(0, np.pi, h))
grid_preds = np.array([predict(np.array([a, b]), theta_opt) for a, b in zip(xx.ravel(), yy.ravel())])
axes[0].contourf(xx, yy, grid_preds.reshape(xx.shape), alpha=0.3, cmap='coolwarm')
axes[0].scatter(X_scaled[:,0], X_scaled[:,1], c=y, cmap='coolwarm', edgecolor='k')
axes[0].set_title('Quantum Classifier Decision Regions'); axes[0].set_xlabel('feature 1 (scaled)'); axes[0].set_ylabel('feature 2 (scaled)')

axes[1].bar(['Quantum\n(test)', 'SVM RBF\n(test)'], [test_acc, svm_acc], color=['#55A868','#C44E52'])
axes[1].set_ylim(0,1.05); axes[1].set_title('Quantum vs Classical Accuracy')
plt.tight_layout()
plt.savefig('lab24_qml_full_analysis.png', dpi=150)
plt.show()</code></pre><p><strong>Expected Output:</strong></p><div class="box box-generic"><p>▶  Exp 24 — Expected Output &amp; Console Results</p><pre>  Expected results for Experiment 24:
  Quantum feature map Φ(x): ZZFeatureMap encodes classical data x into quantum state |Φ(x)⟩ with ZZ interactions. Quantum kernel: K(x,x’) = |⟨Φ(x’)|Φ(x)...
  Actual console output for Experiment 24:
  Multi-start warm-up best training accuracy: 0.671
  Quantum classifier (after COBYLA polish): train=0.671  test=0.567
  Classical SVM (RBF) baseline: test=1.000
  Note: shallow (2-qubit) variational classifiers are notoriously hard to train
  with derivative-free optimisers like COBYLA -- the loss landscape has many flat
  regions and local minima. Multi-start random search followed by local polishing
  is a standard practical workaround, though quantum accuracy typically still
  trails a classical SVM baseline on this small a circuit.</pre><img class="fig-img" src="content/images/image14.png"/></div><h2 id="3-observation-and-results-8">3. Observation and Results</h2><h3 id="observation-tables-2">Observation Tables</h3><p><em>Record all experimental data for Experiment 24 in the tables below. Complete during the practical session using actual measurements from simulation and/or IBM Quantum hardware.</em></p><table>
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
</table><h2 id="4-discussion-questions-8">4. Discussion Questions</h2><ol type="1"><li><p>Your quantum classifier likely performed worse than the classical SVM on this dataset even though the underlying classes are linearly separable. What does this suggest about the ZZFeatureMap's effect on separability?</p></li><li><p>Why is COBYLA (a derivative-free optimiser) a common choice for training small variational quantum classifiers, and what practical difficulty did you observe with it during training?</p></li><li><p>How would you expect the classifier's performance to change if you used 4 qubits and 4 features instead of 2? What tradeoffs come with that increase?</p></li><li><p>Write complete answers with supporting calculations, equations, and diagrams.</p></li><li><p>For IBM Hardware experiments: justify your choice of backend, qubit pair, and optimisation level.</p></li><li><p>Compare simulation vs hardware results and quantify all sources of error.</p></li></ol><h2 id="5-lab-record-requirements-8">5. Lab Record Requirements</h2><ul><li><p>Run the First Program. Record key outputs and verify the basic concept.</p></li><li><p>Run the Full Program. Save all generated figures (label them lab24_*.png).</p></li><li><p>Complete all observation tables during the practical session.</p></li><li><p>Write complete, well-reasoned answers to all Discussion Questions.</p></li></ul><table>
<colgroup>
<col style="width: 6%"/>
<col style="width: 93%"/>
</colgroup>
<tbody>
<tr class="odd"><td colspan="2"><strong>⭐  VIVA VOCE QUESTIONS &amp; ANSWERS</strong></td></tr>
<tr class="even"><td><strong>Q1</strong></td><td><strong>What is a quantum feature map?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A quantum feature map Φ: R^n → H maps classical data x to a quantum state |Φ(x)⟩. ZZFeatureMap encodes xᵢ as a rotation and uses two-qubit interactions (CX·Rz(2(π-xᵢ)(π-xⱼ))·CX) to create entanglement between features. The quantum kernel K(x,x’)=|⟨Φ(x’)|Φ(x)⟩|² implicitly computes inner products in an exponentially large Hilbert space — potentially capturing correlations inaccessible to classical kernels.</td></tr>
<tr class="even"><td><strong>Q2</strong></td><td><strong>What is quantum advantage in machine learning?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Theoretical QML advantages: (1) quantum kernel methods can access kernel functions classically intractable to compute; (2) quantum linear algebra (HHL) solves linear systems exponentially faster (with caveats); (3) quantum sampling-based ML can learn distributions classical computers cannot sample efficiently. Practical: no convincing quantum advantage over classical ML has been demonstrated on real datasets. Quantum ML advantage likely requires fault-tolerant hardware and problem-specific quantum structure.</td></tr>
<tr class="even"><td><strong>Q3</strong></td><td><strong>What is the parameter-shift rule?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>For parametrised gate R(θ) = e^{-iθG/2} (G = Pauli): d⟨E⟩/dθ = (⟨E(θ+π/2)⟩ − ⟨E(θ-π/2)⟩)/2. Only 2 circuit evaluations per parameter — unlike classical backpropagation which computes all gradients in one pass. Total gradient cost: 2p evaluations for p parameters. Compatible with finite shots (stochastic gradients). Used in VQE, QAOA, QML training. Cannot be applied to non-Pauli gates without modification.</td></tr>
<tr class="even"><td><strong>Q4</strong></td><td><strong>What is the barren plateau problem?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Barren plateaus: for random parametrised circuits of depth O(n), the gradient ∂⟨H⟩/∂θ_k vanishes exponentially: Var[∂⟨H⟩/∂θ_k] = O(2^{-n}). Solutions: (1) layer-by-layer training; (2) problem-specific initial states; (3) local cost functions; (4) correlating parameters. Fundamental challenge for VQE/QML scalability beyond ~10 qubits.</td></tr>
<tr class="even"><td><strong>Q5</strong></td><td><strong>Compare classical SVM and quantum SVM.</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Classical SVM (RBF kernel): kernel K(x,x’)=exp(-||x-x’||^2/2σ^2). Extremely efficient for structured data; O(n^2) training. Quantum SVM: kernel K_Q(x,x’)=|⟨Φ(x’)|Φ(x)⟩|². Potentially captures correlations inaccessible to classical kernels. But: computing K_Q requires O(n^2) quantum circuits. Current hardware: shot noise and gate errors degrade quantum kernel quality. Classical SVM typically outperforms quantum SVM on standard datasets — quantum advantage not yet demonstrated.</td></tr>
<tr class="even"><td><strong>Q6</strong></td><td><strong>Why is the ZZFeatureMap considered 'hard to simulate classically', and does that automatically make it a GOOD choice for a quantum classifier?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The ZZFeatureMap uses entangling ZZ interactions whose expectation values are conjectured to be difficult to estimate with classical methods for larger qubit counts, which is why it's cited in quantum advantage discussions. However, being hard to simulate does not guarantee the resulting feature space is well-suited to the specific classification task, as this experiment's results illustrate.</td></tr>
<tr class="even"><td><strong>Q7</strong></td><td><strong>Why might a shallow (2-qubit, few-parameter) variational ansatz struggle to match a classical SVM's accuracy on an easily linearly-separable dataset?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A shallow ansatz has limited expressive power and, combined with a feature map that may distort the original linear separability, can only represent a restricted family of decision boundaries. The classical SVM with an RBF kernel has no such qubit-count restriction and can flexibly fit the data's true separating boundary.</td></tr>
<tr class="even"><td><strong>Q8</strong></td><td><strong>What is 'barren plateau' and why is it a relevant concern when training variational quantum circuits like this one with COBYLA?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>A barren plateau refers to regions of the parameter landscape where the cost function's gradient becomes exponentially small as circuit size grows, making it very difficult for any optimiser (gradient-based or derivative-free) to find a good direction to improve. Even at this small scale, flat regions in the loss landscape can cause COBYLA to converge slowly or get stuck.</td></tr>
<tr class="even"><td><strong>Q9</strong></td><td><strong>Why does the multi-start random search strategy used in the Full Program help avoid poor local optima?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Testing many independent random parameter initialisations before running local optimisation increases the chance that at least one starting point lies in a favourable region of the loss landscape, reducing the risk that COBYLA polishes a poor starting guess into a mediocre local minimum.</td></tr>
<tr class="even"><td><strong>Q10</strong></td><td><strong>How is the predicted class determined from the quantum circuit's output in this experiment?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>The circuit's qubit 0 is measured, and the probability of observing outcome |0&gt; is computed. If P(0) is greater than 0.5 the sample is classified as class 0, otherwise as class 1 -- equivalent to thresholding the expectation value &lt;Z&gt; at zero.</td></tr>
<tr class="even"><td><strong>Q11</strong></td><td><strong>What would you expect to happen to training and test accuracy if the ansatz had many more parameters (e.g. reps=6 instead of reps=2)?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Training accuracy would likely improve since a higher-capacity ansatz can fit the training data more flexibly, but test accuracy could plateau or even degrade due to overfitting, and training itself would become slower and harder to converge with a derivative-free optimiser exploring a larger parameter space.</td></tr>
<tr class="even"><td><strong>Q12</strong></td><td><strong>Why is cross-entropy loss used to train the classifier instead of directly optimising classification accuracy?</strong></td></tr>
<tr class="odd"><td><strong>A</strong></td><td>Accuracy is a step-function of the parameters (it only changes when a prediction flips across the decision threshold), giving zero gradient almost everywhere and no useful signal for optimisation. Cross-entropy loss is smooth in the underlying probabilities, giving the optimiser continuous feedback on how CONFIDENTLY correct or incorrect each prediction is.</td></tr>
</tbody>
</table>