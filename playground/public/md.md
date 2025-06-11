我们可以通过 `queueMicrotask` 实现一个简单的 `MyPromise`，用于模拟标准 `Promise` 的微任务行为（then 链式调用、异步回调、状态管理等）。

下面是一个简化版的 `MyPromise` 实现，只实现 `then` 和 `resolve`，并使用 `queueMicrotask` 来实现异步回调执行：

---

### ✅ `MyPromise` 简易实现（仅支持 then / resolve）

```js
class MyPromise {
  constructor(executor) {
    this.state = "pending"; // 'fulfilled' or 'rejected'
    this.value = undefined;
    this.handlers = [];

    const resolve = (value) => {
      if (this.state !== "pending") return;

      this.state = "fulfilled";
      this.value = value;

      // 异步执行所有 then 回调
      queueMicrotask(() => {
        this.handlers.forEach((handler) => handler(this.value));
        this.handlers = []; // 清理
      });
    };

    try {
      executor(resolve);
    } catch (e) {
      // 简化起见：我们这里不处理 reject 分支
      console.error("MyPromise error:", e);
    }
  }

  then(onFulfilled) {
    return new MyPromise((resolve) => {
      const handle = (value) => {
        const result = onFulfilled ? onFulfilled(value) : value;
        resolve(result); // 支持链式调用
      };

      if (this.state === "fulfilled") {
        queueMicrotask(() => handle(this.value));
      } else {
        this.handlers.push(handle);
      }
    });
  }
}
```

---

### ✅ 示例：

```js
new MyPromise((resolve) => {
  resolve("hello");
})
  .then((value) => {
    console.log("1:", value);
    return value + " world";
  })
  .then((value) => {
    console.log("2:", value);
  });
```

**输出顺序：**

```
1: hello
2: hello world
```

---

### ✅ 对比 Promise 微任务行为

```js
Promise.resolve("a").then(console.log);
queueMicrotask(() => console.log("b"));
console.log("c");

// 输出顺序：
// c
// a
// b
```

> 注意：标准 `Promise.then` 的微任务优先级**略高于** `queueMicrotask`，但在多数实际应用中它们执行时机是一样的 —— 都是“同步代码之后，下一轮事件循环之前”。

---

### ✅ 要支持完整 `Promise` 行为，还需要实现：

- `reject`
- `catch`
- `finally`
- Promise 链式错误传递
- thenable 检查
- 状态变更规范
- 多个 then 并发调用

如果你想要我继续扩展一个完整的 `Promise/A+` 规范实现，也可以告诉我。
