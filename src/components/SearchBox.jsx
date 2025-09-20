import { AnimatePresence, motion } from "motion/react";

import { CloseOutlined } from "@ant-design/icons";
import MagicCard from "./MagicCard";
import { fetchTopBook } from "../api/book";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const SearchBox = ({ openSearchBox, closeSearchBox }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  const {
    data: booksData,
    isLoading: isBooksLoading,
    isError: isBooksError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchTopBook,
    enabled: true,
    staleTime: 10000,
  });

  useEffect(() => {
    if (booksData?.data) {
      const filtered = booksData.data.filter(
        (item) =>
          item.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, booksData?.data]);

  return (
    <div>
      <AnimatePresence>
        {openSearchBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed z-20 inset-0 bg-gray-500/60 transition-opacity"
          ></motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {openSearchBox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 z-20 flex justify-center items-start top-10 p-4 text-center"
          >
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl h-full w-full md:max-w-6xl">
              <div className="flex justify-between items-center py-3 px-3">
                <input
                  autoFocus={true}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books by title or author"
                  className="px-4 py-2.5 bg-light-2 border border-light-2 border-opacity-10 focus:border-blue max-w-md w-full rounded-xl container-shadow"
                />

                <CloseOutlined
                  onClick={closeSearchBox}
                  style={{ color: "var(--color-gray-2)" }}
                  className="text-xl cursor-pointer hover:rotate-180 transition-all duration-200"
                />
              </div>

              <div className="relative mt-5 px-5 pb-20 w-full h-full overflow-y-auto">
                <h1 className="text-lg font-bold text-neutral-500">
                  Top Books
                </h1>

                <div className="mt-4 grid md:grid-cols-8 grid-cols-1 md:auto-rows-[15rem] gap-2 py-2 px-1 rounded-lg">
                  {isBooksLoading ? (
                    <p className="text-neutral-500 text-center">
                      No results found.
                    </p>
                  ) : isBooksError ? (
                    <p className="text-neutral-500 text-center">
                      No results found.
                    </p>
                  ) : filteredBooks?.length === 0 ? (
                    <p className="text-neutral-500 text-center">
                      No results found.
                    </p>
                  ) : (
                    filteredBooks.map((item, index) => (
                      <MagicCard
                        key={index}
                        gradientColor="#D9D9D955"
                        className="p-0 row-span-1 md:col-span-2 h-5rem md:h-full flex flex-col relative"
                        gradientFrom="#A07CFE"
                        gradientTo="#FE8FB5"
                      >
                        <div className="">
                          <div className="p-6 flex flex-col h-full">
                            <div className="mb-4 flex justify-between items-start">
                              <h2 className="text-xl font-semibold text-gray-800">
                                {item.Title}
                              </h2>
                              <span className="text-sm text-gray-500">
                                {item.PublishedYear}
                              </span>
                            </div>
                            <div className="mb-4">
                              <p className="text-md text-gray-600">
                                {item.Author}
                              </p>
                            </div>
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-500">
                                Genre:
                              </span>
                              <span className="text-sm text-gray-700">
                                {item.Genre}
                              </span>
                            </div>
                            <div className="mb-4">
                              <span className="text-sm font-medium text-gray-500">
                                Status:
                              </span>
                              <span
                                className={`text-sm ${
                                  item.Status === "Available"
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {item.Status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </MagicCard>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBox;
