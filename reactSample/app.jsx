// === Reactの機能（Hooks）を準備 ===
// useState: 画面のデータ（状態）を記憶・更新するための機能
// useEffect: 何かのデータが変化した際に、追加の処理（例えば保存など）を走らせる機能
const { useState, useEffect } = React;

// ----------------------------------------------------
// 【コンポーネント1】 アプリ全体を管理する親コンポーネント
// ----------------------------------------------------
function TodoApp() {
    // 1. 状態（State）の定義
    // todos: 今のTodoリストのデータ。(初期状態としてサンプルデータを1つ設定)
    // setTodos: todosのデータを書き換えるための専用の関数
    const [todos, setTodos] = useState([
        { id: 1, text: "Reactの基礎を学ぶ", completed: false }
    ]);
    
    // inputText: ユーザーがテキストボックスに入力中の文字データ
    // setInputText: 入力中の文字データを書き換える関数
    const [inputText, setInputText] = useState("");

    // 2. 副作用（Effect）の定義
    // 初回読み込み時や、todosの中身が変わるたびに実行される処理（ここではコンソールへの出力のみ）
    useEffect(() => {
        console.log("現在のTodo一覧:", todos);
    }, [todos]);

    // 3. アクション（動作）の定義
    // 新しいTodoを追加する処理
    const handleAddTodo = (e) => {
        e.preventDefault(); // フォーム送信で画面がリロードされるのを防ぐ
        
        if (inputText.trim() === "") return; // 空文字なら何もしない

        const newTodo = {
            id: Date.now(), // 現在の時刻を簡単なユニークIDとして利用
            text: inputText,
            completed: false
        };

        // 新しい配列を作ってsetTodosに渡すことで画面を更新する
        setTodos([...todos, newTodo]);
        setInputText(""); // 入力欄を空に戻す
    };

    // Todoの完了/未完了を切り替える処理
    const handleToggleTodo = (id) => {
        // mapを使って配列を走査し、idが一致するもののcompletedを反転させる
        const updatedTodos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        setTodos(updatedTodos);
    };

    // Todoを削除する処理
    const handleDeleteTodo = (id) => {
        // filterを使って、指定されたid以外の要素だけを残した新しい配列を作る
        const filteredTodos = todos.filter(todo => todo.id !== id);
        setTodos(filteredTodos);
    };

    // 4. 画面（UI）の定義 (JSXというHTMLに似た文法で記述)
    return (
        <div className="app-container">
            <header className="header">
                <h1>📚 React学習サンプル</h1>
                <p>コンポーネントと状態管理（State）を学ぶTodoアプリ</p>
                <a href="../index.html" className="back-link">← トップページへ戻る</a>
            </header>

            <main className="main-content">
                {/* フォーム部分 */}
                <form onSubmit={handleAddTodo} className="todo-form">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)} // 入力があるたびにStateを更新
                        placeholder="新しいタスクを入力..."
                        className="todo-input"
                    />
                    <button type="submit" className="add-button">追加</button>
                </form>

                {/* リスト部分 */}
                <ul className="todo-list">
                    {todos.length === 0 ? (
                        <p className="empty-message">タスクがありません。追加してみましょう！</p>
                    ) : (
                        // todosの配列データをもとに、TodoItemコンポーネントを繰り返し生成する
                        todos.map(todo => (
                            <TodoItem 
                                key={todo.id} 
                                todo={todo} 
                                onToggle={() => handleToggleTodo(todo.id)}
                                onDelete={() => handleDeleteTodo(todo.id)}
                            />
                        ))
                    )}
                </ul>
            </main>
        </div>
    );
}

// ----------------------------------------------------
// 【コンポーネント2】 Todoリストの1行分を表現する子コンポーネント
// 部品化することでコードの見通しが良くなります。
// ----------------------------------------------------
function TodoItem({ todo, onToggle, onDelete }) {
    // 状態（完了かどうか）によって適用するスタイル（CSSクラス）を変える
    const itemClass = todo.completed ? "todo-item completed" : "todo-item";

    return (
        <li className={itemClass}>
            <div className="todo-content" onClick={onToggle}>
                <span className="checkbox">
                    {todo.completed ? "☑️" : "🔲"}
                </span>
                <span className="todo-text">{todo.text}</span>
            </div>
            <button className="delete-button" onClick={onDelete}>削除</button>
        </li>
    );
}

// ----------------------------------------------------
// 【アプリケーションの起動】
// id="root" の要素に対して、作成した TodoApp コンポーネントを描画する
// ----------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TodoApp />);
