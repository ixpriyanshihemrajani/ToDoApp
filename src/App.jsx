import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination, Modal, Input, Button, Skeleton } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import "./App.css";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [todosPerPage, setTodosPerPage] = useState(5);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [updatedTodoTitle, setUpdatedTodoTitle] = useState("");
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetchTodos();
  }, [currentPage, todosPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true); 
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/todos"
      );
      if (response.status === 200) {
        setTodos(response.data);
      } else {
        console.error("Error fetching todos: Unexpected status code");
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      // setLoading(false); 
    }
  };

  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const addTodo = () => {
    if (newTodoTitle.trim() === "") {
      return; 
    }
  
    const newTodo = {
      id: todos.length + 1, 
      title: newTodoTitle,
      completed: false,
    };
  
    const updatedTodos = [...todos, newTodo]; 
    setTodos(updatedTodos); 
    setIsModalVisible(false);
    setNewTodoTitle("");
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const updateTodo = async (id, updatedTitle) => {
    try {
      await axios.put(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        title: updatedTitle,
      });
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, title: updatedTitle } : todo
        )
      );
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const openEditModal = (todo) => {
    setSelectedTodo(todo);
    setUpdatedTodoTitle(todo.title);
    setEditModalVisible(true);
  };

  return (
    <div className="todo-app">
      <div className="top-bar">
        <h1>Todo App</h1>
        <button className="add-button" onClick={() => setIsModalVisible(true)}>
          <PlusOutlined /> Add Todo
        </button>
      </div>
      <div className="todo-container">
        {loading ? ( 
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          currentTodos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-card ${
                todo.completed ? "completed" : "incomplete"
              }`}
            >
              <h2>{todo.title}</h2>
              <p className="status">
                Status: {todo.completed ? "Completed" : "Incomplete"}
              </p>
              <div className="todo-actions">
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                <button onClick={() => openEditModal(todo)}>Edit</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="pagination">
        <Pagination
          defaultPageSize={10}
          className='page'
          current={currentPage}
          pageSize={todosPerPage}
          total={200} 
          showSizeChanger={true}
          pageSizeOptions={['5', '10', '15', '20', '25', '30', '40', '50', '100']}
          onChange={handlePageChange}
          onShowSizeChange={(currentPage, size) => {
            setTodosPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>
      <Modal
        title="Add Todo"
        visible={isModalVisible}
        onOk={addTodo}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Enter todo title"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          required
        />
      </Modal>
      <Modal
        title="Edit Todo"
        visible={editModalVisible}
        onOk={() => updateTodo(selectedTodo.id, updatedTodoTitle)}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input
          placeholder="Enter updated todo title"
          value={updatedTodoTitle}
          onChange={(e) => setUpdatedTodoTitle(e.target.value)}
          required
        />
      </Modal>
    </div>
  );
};

export default TodoApp;