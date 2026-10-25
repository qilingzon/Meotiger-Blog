#!/usr/bin/env bash
# 一致性检查骨架（按项目填充检查项）。用法：bash tools/acceptance/consistency_check.sh
cd "$(dirname "$0")/../.." || exit 1
fail=0
ok()  { echo "  PASS: $1"; }
bad() { echo "  FAIL: $1"; fail=1; }

echo "=== 1. 构建产物存在且版本一致 ==="
# 示例：核对版本文件与产物（按项目改）
grep -q "version" . 2>/dev/null && ok "版本文件存在" || bad "版本文件缺失"

echo "=== 2. 资源/配置文件合法性 ==="
python - <<'EOF'
import glob, json, sys
bad = []
for f in glob.glob('**/*.json', recursive=True):
    if 'node_modules' in f or '.git' in f: continue
    try: json.load(open(f, encoding='utf-8'))
    except Exception as e: bad.append((f, str(e)))
print("  FAIL: " + str(bad) if bad else "  PASS: JSON 全部合法")
sys.exit(1 if bad else 0)
EOF
[ $? -ne 0 ] && fail=1

echo "=== 3. TODO：项目特有检查项 ==="
# 在这里加：ID 引用、命名规范、规格交叉引用、回归清单触发等
ok "（骨架，待填充）"

echo
if [ $fail -eq 0 ]; then echo "全部通过 ✓"; else echo "存在失败项"; exit 1; fi
