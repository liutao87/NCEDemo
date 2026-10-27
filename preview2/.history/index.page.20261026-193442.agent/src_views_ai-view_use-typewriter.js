import { useEffect, useState } from "react";

// 逐字打印 hook:
// - enabled 变为 true(或 runKey 变化)时从 0 重新开始,每 30ms 打印 speed 个字符
// - enabled 变回 false 时停止但保留已打印内容(供折叠后再展开查看)
// - done 表示已打印至末尾
export function useTypewriter(text, { runKey = 0, speed = 1, enabled = true } = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    setCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i += speed;
      if (i >= text.length) {
        i = text.length;
        clearInterval(timer);
      }
      setCount(i);
    }, 30);
    return () => clearInterval(timer);
  }, [text, runKey, speed, enabled]);

  return { shown: text.slice(0, count), done: count >= text.length };
}
