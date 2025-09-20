const fetchData = async ({ queryKey }) => {
  const [, { pagination }] = queryKey;

  const queryParams = new URLSearchParams({
    _per_page: pagination.pageSize,
    _page: pagination.current,
  });

  const url = `http://localhost:3000/books?${queryParams.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
};

const fetchGenre = async () => {
  const response = await fetch("http://localhost:3000/books");
  const books = await response.json();

  // Extract unique genres
  const uniqueGenres = [...new Set(books.map((book) => book.Genre))];

  const formattedGenres = uniqueGenres.map((genre) => ({
    text: genre,
    value: genre,
  }));

  return formattedGenres;
};

const fetchTopBook = async () => {
  let page =1;
  const response = await fetch(
    `http://localhost:3000/books?_sort=-id&${
      page ? `_page=${page}&_per_page=5` : ""
    }`
  );
  const books = await response.json();

  return books;
};

const addData = async (data) => {
  const response = await fetch("http://localhost:3000/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to add data");

  return Array.isArray(response.json()) ? res : [];
};

const updateBook = async (bookId, updatedData) => {
  const response = await fetch(`http://localhost:3000/books/${bookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) throw new Error("Failed to update data");
  return response.json();
};

const getBookById = async (id) => {
  const response = await fetch(`http://localhost:3000/books/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

const deleteBook = async (bookId) => {
  const response = await fetch(`http://localhost:3000/books/${bookId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete data");
  return response.json();
};

export { fetchData, fetchGenre, addData, updateBook, getBookById, deleteBook,fetchTopBook };
