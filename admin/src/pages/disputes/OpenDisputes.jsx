import React, { useState } from "react";
import { Table, Tag, Select, Input, Button, Card } from "antd";
import { FaSearch, FaFilter, FaExclamationTriangle, FaFolderOpen } from "react-icons/fa";

const { Option } = Select;

const OpenDisputes = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample dispute data
  const disputes = [
    {
      key: "1",
      id: "#OD001",
      user: "John Doe",
      reason: "Unauthorized Transaction",
      status: "Pending",
      date: "2025-02-20",
    },
    {
      key: "2",
      id: "#OD002",
      user: "Jane Smith",
      reason: "Payment Not Received",
      status: "In Progress",
      date: "2025-02-18",
    },
    {
      key: "3",
      id: "#OD003",
      user: "Alice Johnson",
      reason: "Fraudulent Activity",
      status: "Pending",
      date: "2025-02-17",
    },
    {
      key: "4",
      id: "#OD004",
      user: "Mark Wilson",
      reason: "Duplicate Charge",
      status: "In Progress",
      date: "2025-02-16",
    },
  ];

  // Filtered disputes based on status & search
  const filteredDisputes = disputes.filter(
    (dispute) =>
      (filterStatus === "All" || dispute.status === filterStatus) &&
      dispute.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dispute table columns
  const columns = [
    {
      title: "Dispute ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Pending" ? "orange" : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-lg text-white text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FaFolderOpen className="text-yellow-300" /> Open Disputes
        </h2>
        <p className="text-gray-200 text-sm mt-2">
          Track and manage open disputes effectively.
        </p>
      </div>

      {/* Search & Filter Section */}
      <Card className="mt-6 p-6 shadow-md rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
            <FaSearch className="text-gray-400" />
            <Input
              placeholder="Search by user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
            <FaFilter className="text-gray-400" />
            <Select
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              className="w-full"
              size="large"
            >
              <Option value="All">All</Option>
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
            </Select>
          </div>

          {/* Reset Button */}
          <Button
            type="default"
            onClick={() => {
              setFilterStatus("All");
              setSearchTerm("");
            }}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Dispute Table */}
      <Card className="mt-6 p-6 shadow-md rounded-lg">
        <Table
          columns={columns}
          dataSource={filteredDisputes}
          pagination={{ pageSize: 5 }}
          bordered
          className="overflow-x-auto"
        />
      </Card>
    </div>
  );
};

export default OpenDisputes;
