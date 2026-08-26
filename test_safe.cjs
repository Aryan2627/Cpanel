function safeEvaluate(expr) {
  // basic math evaluator without eval()
  try {
    // replace all whitespace
    expr = expr.replace(/\s+/g, '');
    // simple a * b
    if (expr.includes('*')) {
      const parts = expr.split('*');
      return Number(parts[0]) * Number(parts[1]);
    }
    if (expr.includes('+')) {
      const parts = expr.split('+');
      return Number(parts[0]) + Number(parts[1]);
    }
    if (expr.includes('-')) {
      const parts = expr.split('-');
      return Number(parts[0]) - Number(parts[1]);
    }
    if (expr.includes('/')) {
      const parts = expr.split('/');
      return Number(parts[0]) / Number(parts[1]);
    }
    return Number(expr);
  } catch(e) {
    return 0;
  }
}
console.log(safeEvaluate("100 * 50"));
console.log(safeEvaluate(" 100 + 50 "));
