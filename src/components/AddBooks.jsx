import { AnimatePresence, motion } from "framer-motion";
import { DatePicker, message, Select, Spin } from "antd";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";

import { Controller, useForm } from "react-hook-form";
import Input from "./Input";
import { addData, fetchGenre, updateBook } from "../api/book";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const AddBooks = ({ open, onClose, book }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const [isStatusFocused, setIsStatusFocused] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
    setFocus,
    control,
    watch,
  } = useForm();

  const StatusItem = [
    {
      text: "Available",
      value: "Available",
    },
    {
      text: "Issued",
      value: "Issued",
    },
  ];

  useEffect(() => {
    if (book) {
      reset({
        Title: book.Title,
        Author: book.Author,
        Genre: book.Genre,
        PublishedYear: book.PublishedYear,
        Status: book.Status,
      });
    } else {
      reset({
        Title: "",
        Author: "",
        Genre: "",
        PublishedYear: "",
        Status: "",
      });
    }
  }, [book, reset]);

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
    mutate: addBook,
    isLoading: isAddLoading,
    isError: isAddError,
    error: addError,
  } = useMutation({
    mutationFn: addData,
    onMutate: () => {
      return { id: 1 };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["books"], exact: true });
      reset();
      message.success("New Data Added");
    },
    onError: (error) => {
      message.error(error?.message || "Failed to Add data.");
    },
  });

  const {
    mutate: editBook,
    isLoading: isUpdateLoading,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: ({ id, data }) => updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      message.success("Data updated");
      reset();
    },
    onError: (error) => {
      message.error(error?.message || "Failed to update data.");
    },
  });

  const onSubmit = async (data, e) => {
    e.preventDefault();
    const payload = {
      ...data,
      PublishedYear: Number(data.PublishedYear),
    };

    if (book) {
      editBook({ id: book.id, data: payload });
    } else {
      addBook(payload);
    }

    reset();
    onClose();
  };

  return (
    <div>
      <AnimatePresence>
        {open && (
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
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 z-20 flex items-center justify-center p-4 text-center"
          >
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl w-full sm:max-w-lg">
              <div className="flex justify-end py-3 px-3">
                <CloseOutlined
                  onClick={() => {
                    onClose();
                    reset();
                  }}
                  style={{ color: "var(--color-gray-2)" }}
                  className="text-xl cursor-pointer hover:rotate-180 transition-all duration-200"
                />
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
              >
                <div className="w-full relative mb-3">
                  <Input
                    type="text"
                    {...register("Title", {
                      required: {
                        value: true,
                        message: "Book Title required",
                      },
                    })}
                    aria-invalid={errors.Title ? "true" : "false"}
                    className={`input-box${errors.Title ? " error" : ""}`}
                    required
                    autoComplete="off"
                  />

                  <label className="label-txt">Book Title</label>

                  {errors.Title && (
                    <span className="error-msg">
                      {errors.Title?.message}grtrttt
                    </span>
                  )}
                </div>

                <div className="w-full flex flex-col md:flex-row items-center gap-3 mb-3">
                  <div className="w-full md:w-[35rem] relative">
                    <Input
                      type="text"
                      {...register("Author", {
                        required: {
                          value: true,
                          message: "Author is required",
                        },
                      })}
                      aria-invalid={errors.Author ? "true" : "false"}
                      className={`input-box${errors.Author ? " error" : ""}`}
                      autoComplete="off"
                      required
                    />
                    <label className="label-txt">Author</label>
                    {errors.Author && (
                      <span className="error-msg">{errors.Author.message}</span>
                    )}
                  </div>

                  <div className="w-full relative">
                    <Controller
                      control={control}
                      name="Genre"
                      rules={{
                        required: "Genre is required",
                      }}
                      render={({ field }) => (
                        <Select
                          onFocus={() => setIsSelectFocused(true)}
                          onBlur={() => setIsSelectFocused(false)}
                          onChange={(value) => field.onChange(value)}
                          value={field.value || ""}
                          className={`input-box select-picker${
                            errors.Genre ? " error" : ""
                          }${
                            field.value || isSelectFocused ? " has-value" : ""
                          }`}
                          options={genresData.map((genre) => ({
                            label: genre.text,
                            value: genre.text,
                          }))}
                          allowClear
                          variant="borderless"
                          required
                        />
                      )}
                    />
                    <label
                      className={`label-txt${
                        watch("Genre") || getValues("Genre") || isSelectFocused
                          ? " float"
                          : ""
                      }`}
                    >
                      Genre
                    </label>
                    {errors.Genre && (
                      <span className="error-msg">{errors.Genre.message}</span>
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col md:flex-row items-center gap-3 mb-3">
                  <div className="max-h-1/2 w-full relative">
                    <Controller
                      control={control}
                      name="PublishedYear"
                      rules={{
                        required: "Published Year is required",
                      }}
                      render={({ field }) => (
                        <DatePicker
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          picker="year"
                          onChange={(date, dateString) => {
                            field.onChange(Number(dateString));
                          }}
                          value={
                            field.value
                              ? dayjs(String(field.value), "YYYY")
                              : null
                          }
                          className={`input-box ant-picker${
                            errors.PublishedYear ? " error" : ""
                          }${field.value || isFocused ? " has-value" : ""}`}
                          format="YYYY"
                          placeholder=""
                          required
                        />
                      )}
                    />

                    <label
                      className={`label-txt${
                        watch("PublishedYear") ||
                        getValues("PublishedYear") ||
                        isFocused
                          ? " float"
                          : ""
                      }`}
                    >
                      Published Year
                    </label>

                    {errors.PublishedYear && (
                      <span className="error-msg">
                        {errors.PublishedYear.message}
                      </span>
                    )}
                  </div>

                  <div className="w-full relative">
                    <Controller
                      control={control}
                      name="Status"
                      rules={{
                        required: "Status is required",
                      }}
                      render={({ field }) => (
                        <Select
                          onFocus={() => setIsStatusFocused(true)}
                          onBlur={() => setIsStatusFocused(false)}
                          onChange={(value) => field.onChange(value)}
                          value={field.value || ""}
                          className={`input-box select-picker${
                            errors.Status ? " error" : ""
                          }${
                            field.value || isStatusFocused ? " has-value" : ""
                          }`}
                          options={StatusItem.map((status) => ({
                            label: status.text,
                            value: status.text,
                          }))}
                          allowClear
                          variant="borderless"
                          required
                        />
                      )}
                    />
                    <label
                      className={`label-txt${
                        watch("Status") ||
                        getValues("Status") ||
                        isStatusFocused
                          ? " float"
                          : ""
                      }`}
                    >
                      Status
                    </label>
                    {errors.Status && (
                      <span className="error-msg">{errors.Status.message}</span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 flex justify-end py-3">
                  <button
                    type="submit"
                    className="inline-flex sm:max-w-20 w-full justify-center rounded-md bg-orange-400 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 cursor-pointer"
                  >
                    {!(isAddLoading || isUpdateLoading) ? (
                      book ? (
                        "Update"
                      ) : (
                        "Add"
                      )
                    ) : (
                      <Spin
                        indicator={
                          <LoadingOutlined spin style={{ color: "#fff" }} />
                        }
                      />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AddBooks;
