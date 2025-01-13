import { useEffect, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

import { retrieveTickets, deleteTicket } from '../api/ticketAPI';
import ErrorPage from './ErrorPage';
import Swimlane from '../components/Swimlane';
import { TicketData } from '../interfaces/TicketData';
import { ApiMessage } from '../interfaces/ApiMessage';

import auth from '../utils/auth';

const boardStates = ['Todo', 'In Progress', 'Done'];

const Board = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [error, setError] = useState(false);
  const [loginCheck, setLoginCheck] = useState(false);

  // New states for filtering and sorting
  const [filters, setFilters] = useState({ status: '', assignedUser: '' });
  const [sortOptions, setSortOptions] = useState({ sortBy: '', sortOrder: 'asc' });

  const checkLogin = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await retrieveTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to retrieve tickets:', err);
      setError(true);
    }
  };

  const deleteIndvTicket = async (ticketId: number): Promise<ApiMessage> => {
    try {
      const data = await deleteTicket(ticketId);
      fetchTickets();
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  useLayoutEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    if (loginCheck) {
      fetchTickets();
    }
  }, [loginCheck]);

  if (error) {
    return <ErrorPage />;
  }

  // Filter and sort tickets based on state
  const getFilteredAndSortedTickets = () => {
    return tickets
      .filter((ticket) => {
        const matchesStatus = !filters.status || ticket.status === filters.status;
        const matchesAssignedUser =
          !filters.assignedUser || ticket.assignedUser?.username === filters.assignedUser;
        return matchesStatus && matchesAssignedUser;
      })
      .sort((a, b) => {
        if (!sortOptions.sortBy) return 0;
        const fieldA = a[sortOptions.sortBy as keyof TicketData] as string | number;
        const fieldB = b[sortOptions.sortBy as keyof TicketData] as string | number;
        if (fieldA < fieldB) return sortOptions.sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortOptions.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  };

  return (
    <>
      {!loginCheck ? (
        <div className="login-notice">
          <h1>Login to create & view tickets</h1>
        </div>
      ) : (
        <div className="board">
          {/* New filter and sort UI */}
          <div className="filter-sort-bar">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <input
              type="text"
              placeholder="Filter by User"
              value={filters.assignedUser}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, assignedUser: e.target.value }))
              }
            />
            <select
              value={sortOptions.sortBy}
              onChange={(e) =>
                setSortOptions((prev) => ({ ...prev, sortBy: e.target.value }))
              }
            >
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="createdAt">Created At</option>
            </select>
            <select
              value={sortOptions.sortOrder}
              onChange={(e) =>
                setSortOptions((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <button type="button" id="create-ticket-link">
            <Link to="/create">New Ticket</Link>
          </button>
          <div className="board-display">
            {boardStates.map((status) => {
              const filteredTickets = getFilteredAndSortedTickets().filter(
                (ticket) => ticket.status === status
              );
              return (
                <Swimlane
                  title={status}
                  key={status}
                  tickets={filteredTickets}
                  deleteTicket={deleteIndvTicket}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Board;
