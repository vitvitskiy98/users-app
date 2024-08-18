import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { requestUsers, requestUsersWithError, Query, User } from "./api";

const baseQuery: Query = {
  name: "",
  age: "",
  limit: 5,
  offset: 0,
};

const UserList: FC = () => {
  const [response, setResponse] = useState<{
    data: User[],
    total: number
  }>({
    data: [],
    total: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<Query>(baseQuery);
  const { data: users } = response;

  const fetchUsers = useCallback(async (params: Query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await requestUsers(params);
      setResponse(response);
    } catch (err) {
      requestUsersWithError(params).catch(setError);
    } finally {
      setIsLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchUsers(query);
  }, [query]);

  const onPaginationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuery(prevState => ({
      ...prevState,
      limit: Number(e.target.value),
      offset: 0
    }))
  }, []);

  const { page, hasPrev, hasNext } = useMemo(() => {
    const totalPages = Math.ceil(response.total / query.limit);
    const page = (query.offset / query.limit) + 1;
    return {
      page,
      hasPrev: page > 1,
      hasNext: page < totalPages
    }
  }, [query, response]);

  const onNextPageClick = useCallback(() => {
    setQuery(prevState => ({
      ...prevState,
      offset: prevState.offset + prevState.limit
    }))
  }, []);

  const onPrevPageClick = useCallback(() => {
    setQuery(prevState => ({
      ...prevState,
      offset: prevState.offset - prevState.limit
    }))
  }, []);

  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(prevState => ({
      ...prevState,
      name: e.target.value,
      offset: 0
    }))
  }, [])
  const onAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(prevState => ({
      ...prevState,
      age: e.target.value,
      offset: 0
    }))
  }, [])

  return (
    <div>
      <div>
        <div className="query-filters">
          <input className="query-input" type="text" placeholder="Name" onChange={onNameChange} />
          <input className="query-input" type="number" placeholder="Age" onChange={onAgeChange} />
        </div>
      </div>
      {!!error && (
          <div className="fetch-error">Failed to fetch users: {error}</div>
      )}
      {isLoading && (<div className="loader">Loading...</div>)}
      {!isLoading && !error && (
        <ul className="users-list">
          {users.map((user) => (
            <li className="users-list__item" key={user.id}>
              {user.name}, {user.age}
            </li>
          ))}
          {!users.length && (
            <li className="users-list__item" key="not-found">
              Users not found
            </li>
          )}
        </ul>
      )}
      <div className="footer">
        <h4>By page:</h4>
        <select name="page-num" id="page-num" onChange={onPaginationChange}>
          <option selected={query.limit === 4} value="4">4</option>
          <option selected={query.limit === 8} value="8">8</option>
          <option selected={query.limit === 16} value="16">16</option>
        </select>
        <button onClick={onPrevPageClick} disabled={!hasPrev}>prev</button>
        <div className="page-num">
          <span>page:</span>
          <span>{page}</span>
        </div>
        <button onClick={onNextPageClick} disabled={!hasNext}>next</button>
      </div>
    </div>
  );
};

export default UserList;
