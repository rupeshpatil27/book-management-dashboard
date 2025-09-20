import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import BooksList from "../components/BooksList";
import AddBooks from "../components/AddBooks";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookById } from "../api/book";
import SearchBox from "../components/SearchBox";

const Home = () => {
  const [open, setOpen] = useState(false);
  const [openSearchBox, setOpenSearchBox] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleOpenSearchBox = () => setOpenSearchBox(true);

  const { data: selectedBook, isLoading: isBookLoading } = useQuery({
    queryKey: ["books", selectedBookId],
    queryFn: () => getBookById(selectedBookId),
    enabled: !!selectedBookId,
  });

  const handleClose = () => {
    setOpen(false);
    setSelectedBookId(null);
  };

  const handleEdit = (id) => {
    setSelectedBookId(id);
    setOpen(true);
  };

  const handleCloseSearchBox = () => {
    setOpenSearchBox(false);
  };

  return (
    <div className="h-full w-full relative">
      <div className="flex justify-center items-center gap-2 mt-15">
        <div
          onClick={handleOpenSearchBox}
          className="px-4 py-2.5 bg-white max-w-md w-full flex items-center rounded-xl cursor-pointer container-shadow"
        >
          <SearchOutlined className="text-xl" style={{ color: "#757575" }} />

          <p className="text-sm md:text-base text-gray-1 pl-2 font-normal w-full">
            Search books by title or author
          </p>
        </div>
        <Tooltip title="Add books" placement="bottom" color={"#757575"}>
          <div
            onClick={handleOpen}
            className="bg-blue rounded-full w-11 h-11 flex items-center justify-center container-shadow cursor-pointer"
          >
            <PlusOutlined style={{ color: "#ffffff" }} className="text-xl" />
          </div>
        </Tooltip>
      </div>

      <div className="flex justify-center items-center my-10">
        <div className="max-w-5xl w-full flex items-stretch flex-col box-border bg-white rounded-xl container-shadow px-5">
          <div className="w-full flex items-center justify-start py-3">
            <div className="text-xl font-medium">Book List</div>
          </div>

          <div className="pt-1 pb-5">
            <div className="w-full border border-light-2 border-opacity-10 rounded-2xl p-1">
              <BooksList handleEdit={handleEdit} />
            </div>
          </div>
        </div>
      </div>
      <AddBooks
        open={open}
        onClose={handleClose}
        book={selectedBookId ? selectedBook : null}
      />

      <SearchBox
        openSearchBox={openSearchBox}
        closeSearchBox={handleCloseSearchBox}
      />
    </div>
  );
};

export default Home;
