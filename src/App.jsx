import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pagination, Modal, Input, Button, Skeleton, Spin } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import "./App.css";
import { ToastContainer, toast } from 'react-toastify'; // Import toast object
import 'react-toastify/dist/ReactToastify.css';

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

  const Delete = import.meta.env.VITE_DELETE;
  const Fetch = import.meta.env.VITE_FETCH;
  const Update = import.meta.env.VITE_UPDATE;
  const Add = import.meta.env.VITE_ADD;

  useEffect(() => {
    fetchTodos();
  }, [currentPage, todosPerPage]);


  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Fetch}`, {
        params: {
          _limit: todosPerPage,
          _page: currentPage
        }
      });
      if (response.status === 200) {
        setTodos(response.data);
      } else {
        toast.error("Error fetching todos: Unexpected status code");
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      toast.error("Error fetching todos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const addTodo = async () => {
    setLoading(true);
    if (newTodoTitle.trim() === "") {
      return;
    }
  
    try {
      const response = await axios.post(`${Add}`, {
        title: newTodoTitle,
        completed: false,
      });
      if (response.status === 201) {
        const newTodo = response.data;
        setTodos([...todos, newTodo]);
        setIsModalVisible(false);
        setNewTodoTitle("");
        setLoading(false);
        toast.success("Todo added successfully");
      } else {
        toast.error("Error adding todo: Unexpected status code");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Error adding todo: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const deleteTodo = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${Delete}${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
      toast.success("Todo deleted successfully"); // Show success message
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Error deleting todo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id, updatedTitle) => {
    try {
      setLoading(true);
      const response = await axios.put(`${Update}${id}`, {
        title: updatedTitle,
      });
      if (response.status === 200) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, title: updatedTitle } : todo
          )
        );
        setEditModalVisible(false);
        toast.success("Todo updated successfully");
      } else {
        toast.error("Error updating todo: Unexpected status code");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Error updating todo: " + error.message);
    } finally {
      setLoading(false);
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
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} active />
            ))}
          </>
        ) : Array.isArray(todos) ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-card ${todo.completed ? "completed" : "incomplete"}`}
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
        ) : (
          <p>Todos is not an array</p>
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
      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default TodoApp;
