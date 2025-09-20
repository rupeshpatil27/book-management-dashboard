import React, { useRef, useState } from "react";
import styled from "styled-components";

import { FilterFilled, SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Popconfirm, Space, Table, Tag } from "antd";
import Highlighter from "react-highlight-words";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteBook, fetchData, fetchGenre } from "../api/book";

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background-color: #fff;
    border-bottom: 0px;
    font-size: 16px;
    font-weight: nomarl;
  }
  .ant-table-thead > tr > th::before {
    display: none;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 0px;
  }
`;

const BooksList = ({ handleEdit }) => {
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const {
    data: booksData,
    isLoading: isBooksLoading,
    isError: isBooksError,
  } = useQuery({
    queryKey: ["books", tableParams],
    queryFn: fetchData,
    enabled: true,
    // gcTime:1000,   default time is 5 sec
    staleTime: 10000,
    placeholderData: keepPreviousData,
  });

  const {
    data: genresData,
    isLoading: isGenresLoading,
    isError: isGenresError,
  } = useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenre,
    enabled: true,
    staleTime: 10000,
  });

  const queryClient = useQueryClient();

  const {
    mutate: removeBook,
    isError: isDeleteError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      message.success("Book deleted!");
    },
    onError: (error) => {
      message.error(error?.message || "Failed to delete book.");
    },
  });

  const handleDelete = (bookId) => {
    removeBook(bookId);
  };

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);

            confirm({ closeDropdown: false });
            setSearchText(e.target.value);
            setSearchedColumn(dataIndex);
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#0a66c2" : "#757575" }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#f5f838", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      ...getColumnSearchProps("Title"),
      render: (value, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record.id)}>{value}</a>
        </Space>
      ),
    },
    {
      title: "Author",
      dataIndex: "Author",
      key: "Author",
      ...getColumnSearchProps("Author"),
    },
    {
      title: "Genre",
      dataIndex: "Genre",
      key: "Genre",
      filters: genresData,
      onFilter: (value, record) => record.Genre.includes(value),
      filterIcon: (filtered) => (
        <FilterFilled style={{ color: filtered ? "#0a66c2" : "#757575" }} />
      ),
    },
    {
      title: "Published Year",
      dataIndex: "PublishedYear",
      key: "PublishedYear",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: (text) => (
        <>
          {text === "Available" ? (
            <Tag color="green" key={text}>
              {text.toUpperCase()}
            </Tag>
          ) : (
            <Tag color="red" key={text}>
              {text.toUpperCase()}
            </Tag>
          )}
        </>
      ),
      filters: [
        {
          text: "Available",
          value: "Available",
        },
        {
          text: "Issued",
          value: "Issued",
        },
      ],
      onFilter: (value, record) => record.Status.includes(value),
      filterIcon: (filtered) => (
        <FilterFilled style={{ color: filtered ? "#0a66c2" : "#757575" }} />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Delete"
            description="Are you sure to delete data?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <StyledTable
      dataSource={booksData?.data}
      columns={columns}
      bordered={false}
      rowKey={(record) => record.id}
      loading={isBooksLoading}
      pagination={{
        ...tableParams.pagination,
        total: booksData?.items || 0,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        onShowSizeChange: (current, pageSize) => {
          setTableParams((prevState) => ({
            ...prevState,
            pagination: {
              ...prevState.pagination,
              current: 1,
              pageSize,
            },
          }));
        },
      }}
      onChange={handleTableChange}
      locale={{
        emptyText: isBooksError ? "Error loading data" : "No Data",
      }}
      scroll={{ x: "max-content" }}
    />
  );
};

export default BooksList;
