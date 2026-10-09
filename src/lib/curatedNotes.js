// Curated High-Yield DSA & System Design Pattern Cheatsheets
// Pre-highlighted using GrindTrack's multi-color highlight syntax:
// ==amber:text== (Key complexity / formula)
// ==cyan:text== (Pointers, variables, indices)
// ==emerald:text== (Base cases, optimal conditions, invariants)
// ==purple:text== (Data structures & patterns)
// ==rose:text== (Pitfalls, edge cases, warnings)

export const CURATED_PATTERN_NOTES = [
  {
    id: 'curated-sliding-window',
    title: 'Sliding Window Master Framework',
    category: 'Patterns',
    tags: ['Sliding Window', 'Two Pointers', 'Array', 'String'],
    accentColor: 'cyan',
    isPinned: true,
    isCurated: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    content: `### When to use
Use when finding a ==emerald:contiguous subarray or substring== satisfying a condition (longest, shortest, exact count, max sum).

### Core Invariant
* ==cyan:right pointer== expands the window by absorbing new elements.
* ==cyan:left pointer== shrinks the window once the window ==rose:violates validity==.
* Time Complexity is always ==amber:O(N)== because each pointer advances at most $N$ times.

### 2 Primary Flavors:
1. **Fixed Size $K$**: Slide window of fixed length $K$. Add \`nums[right]\`, subtract \`nums[right - K]\`.
2. **Dynamic Window**: Expand ==cyan:right== until condition is met, then contract ==cyan:left== while maintaining invariant.

> ==rose:Watch out:== Be careful with empty input strings, strings with 1 character, or all identical characters.`,
    language: 'cpp',
    codeSnippet: `// Standard Dynamic Sliding Window Template (C++)
int slidingWindow(string s) {
    unordered_map<char, int> freq;
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.size(); ++right) {
        freq[s[right]]++; // 1. Expand right

        // 2. Shrink left if window becomes invalid
        while (/* window condition violated */) {
            freq[s[left]]--;
            if (freq[s[left]] == 0) freq.erase(s[left]);
            left++; // Contract
        }

        // 3. Update answer with valid window
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`
  },
  {
    id: 'curated-binary-search',
    title: 'Binary Search: Invariants & Boundary Templates',
    category: 'Templates',
    tags: ['Binary Search', 'Divide & Conquer', 'Templates'],
    accentColor: 'purple',
    isPinned: true,
    isCurated: true,
    createdAt: '2026-10-02T00:00:00.000Z',
    updatedAt: '2026-10-02T00:00:00.000Z',
    content: `### 3 Boundary Conventions
1. **Template 1: Closed Interval \`[left, right]\`**
   * Loop: ==emerald:while (left <= right)==
   * Search space narrows: \`right = mid - 1\` or \`left = mid + 1\`
   * Termination: \`left > right\` (search space empty)

2. **Template 2: Half-Open Interval \`[left, right)\`**
   * Loop: ==emerald:while (left < right)==
   * Right boundary: \`right = mid\`
   * Guaranteed to stop at \`left == right\` (useful for lower_bound / first true).

### Critical Best Practices
* Always compute midpoint safely: ==amber:mid = left + (right - left) / 2== to avoid ==rose:32-bit integer overflow==.
* If searching on answer space (e.g., Koko Eating Bananas, Capacity To Ship Packages), define a predicate ==purple:isValid(mid)== and binary search the range \`[minAnswer, maxAnswer]\`.`,
    language: 'python',
    codeSnippet: `# Binary Search on Answer Space (Python)
def binarySearchOnAnswer(weights, days):
    def isValid(capacity):
        neededDays = 1
        currentLoad = 0
        for w in weights:
            if currentLoad + w > capacity:
                neededDays += 1
                currentLoad = 0
            currentLoad += w
        return neededDays <= days

    left, right = max(weights), sum(weights)
    ans = right

    while left <= right:
        mid = left + (right - left) // 2
        if isValid(mid):
            ans = mid
            right = mid - 1 # Try to find smaller valid capacity
        else:
            left = mid + 1  # Need more capacity

    return ans`
  },
  {
    id: 'curated-monotonic-stack',
    title: 'Monotonic Stack: Next Greater Element & Histogram',
    category: 'Patterns',
    tags: ['Monotonic Stack', 'Stack', 'Array'],
    accentColor: 'amber',
    isPinned: false,
    isCurated: true,
    createdAt: '2026-10-03T00:00:00.000Z',
    updatedAt: '2026-10-03T00:00:00.000Z',
    content: `### Key Concept
A stack whose elements are always strictly ==emerald:monotonically increasing== or ==emerald:decreasing==.

### When to think of Monotonic Stack:
* Next Greater Element / Next Smaller Element
* Previous Greater Element / Previous Smaller Element
* Daily Temperatures
* Largest Rectangle in Histogram & Maximal Rectangle

### Invariant:
* Traverse array. Before pushing current index, ==rose:pop elements that violate monotonic property==.
* The element uncovered beneath is immediately the previous greater/smaller!
* Total runtime is ==amber:O(N)== because every item is pushed once and popped at most once.`,
    language: 'cpp',
    codeSnippet: `// Next Greater Element to Right (C++)
vector<int> nextGreaterElements(const vector<int>& nums) {
    int n = nums.size();
    vector<int> res(n, -1);
    stack<int> st; // Stores indices

    for (int i = 0; i < n; ++i) {
        while (!st.empty() && nums[i] > nums[st.top()]) {
            int prevIdx = st.top();
            st.pop();
            res[prevIdx] = nums[i]; // nums[i] is next greater
        }
        st.push(i);
    }
    return res;
}`
  },
  {
    id: 'curated-tree-graph-cycle',
    title: 'Graph Traversal & Cycle Detection Matrix',
    category: 'Algorithms',
    tags: ['Graph', 'BFS', 'DFS', 'Topological Sort', 'Cycle Detection'],
    accentColor: 'emerald',
    isPinned: false,
    isCurated: true,
    createdAt: '2026-10-04T00:00:00.000Z',
    updatedAt: '2026-10-04T00:00:00.000Z',
    content: `### Directed vs. Undirected Cycle Detection
1. **Undirected Graph**:
   * DFS with ==cyan:parent pointer==: if neighbor is visited and ==rose:neighbor != parent==, a cycle exists.
   * Or use ==purple:Disjoint Set Union (Union-Find)==. If \`find(u) == find(v)\`, edge $(u, v)$ creates a cycle.

2. **Directed Graph**:
   * Three-color DFS:
     * \`0\` = ==cyan:Unvisited==
     * \`1\` = ==rose:Visiting (Currently in recursion stack)==
     * \`2\` = ==emerald:Visited (Completely explored)==
     * If you hit a node in state \`1\`, a ==rose:Back Edge (Cycle)== is found!
   * **Kahn's Algorithm (BFS)**:
     * In-degree array. Push nodes with \`inDegree == 0\` to queue.
     * If processed nodes count $< V$, graph contains a cycle.`,
    language: 'cpp',
    codeSnippet: `// Kahn's Algorithm for Topological Sort & Cycle Detection
bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> inDegree(numCourses, 0);

    for (const auto& edge : prerequisites) {
        adj[edge[1]].push_back(edge[0]);
        inDegree[edge[0]]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; ++i) {
        if (inDegree[i] == 0) q.push(i);
    }

    int visited = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        visited++;

        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    return visited == numCourses; // True if DAG (no cycles)
}`
  },
  {
    id: 'curated-dp-framework',
    title: 'Dynamic Programming: 5-Step System & Patterns',
    category: 'Dynamic Programming',
    tags: ['DP', 'Memoization', 'Tabulation', 'Optimization'],
    accentColor: 'rose',
    isPinned: false,
    isCurated: true,
    createdAt: '2026-10-05T00:00:00.000Z',
    updatedAt: '2026-10-05T00:00:00.000Z',
    content: `### 5-Step DP Formulation
1. **Define State**: Clearly specify what \`dp[i][j]\` represents in words.
2. **Find Base Cases**: What are the trivial solutions (e.g. \`dp[0] = 0\`, \`dp[0][0] = 1\`)?
3. **Derive Transition Equation**: How does \`dp[i]\` depend on prior states?
4. **Determine Order of Computation**: Forward or backward iteration?
5. **Space Optimization**: Can we reduce $O(N \\times M)$ to ==emerald:O(M)== using rolling 1D array?

### Common LeetCode DP Families:
* ==purple:0/1 Knapsack==: Loop items outer, loop weight backwards from $W$ down to $w_i$.
* ==purple:Unbounded Knapsack==: Loop items, loop weight forwards from $w_i$ up to $W$.
* ==purple:Longest Common Subsequence (LCS)==: 2D table comparing characters.
* ==purple:Interval DP==: Loop length \`len\` from 2 to $N$, then loop left endpoint.`,
    language: 'cpp',
    codeSnippet: `// Space-Optimized 0/1 Knapsack (1D Array)
int knapSack(int W, const vector<int>& wt, const vector<int>& val, int n) {
    vector<int> dp(W + 1, 0);

    for (int i = 0; i < n; ++i) {
        // Iterate BACKWARDS to prevent using same item multiple times
        for (int w = W; w >= wt[i]; --w) {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}`
  }
];

export const NOTE_CATEGORIES = [
  'All',
  'Patterns',
  'Templates',
  'Algorithms',
  'Dynamic Programming',
  'Graphs',
  'Data Structures',
  'System Design',
  'Behavioral',
];

export const HIGHLIGHT_COLORS = [
  {
    id: 'amber',
    name: 'Amber',
    label: 'Key Formula',
    colorClass: 'bg-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    previewBorder: 'border-amber-500/40',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    label: 'Pointers / Step',
    colorClass: 'bg-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    previewBorder: 'border-cyan-500/40',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    label: 'Invariant / Optimal',
    colorClass: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    previewBorder: 'border-emerald-500/40',
  },
  {
    id: 'purple',
    name: 'Purple',
    label: 'Pattern / Structure',
    colorClass: 'bg-purple-400',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    previewBorder: 'border-purple-500/40',
  },
  {
    id: 'rose',
    name: 'Rose',
    label: 'Pitfall / Warning',
    colorClass: 'bg-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    previewBorder: 'border-rose-500/40',
  },
];
