const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const Employee = require('./Models/Employee');

const resolvers = {
  Query: {
    async login(_, { username, password }) {
      // Here you would find the user by their username and compare the provided password with the hashed password in the database
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign({ userId: user.id }, '3f8b13c7e1f5b6a8c3d2e4f5a6b7c8d9e0f123456789abcdeffedcba9876543210abcdef0123456789abcdefabcdef');

      return { ...user._doc, id: user._id, token };
    },

    async getAllEmployees() {
      // Fetch all employees from the database
      return await Employee.find({});
    },

    async searchEmployeeByEid(_, { eid }) {
      // Fetch a single employee by their employee ID (eid)
      return await Employee.findById(eid);
    },
  },
  Mutation: {
    async signup(_, { username, email, password }) {
      // Here you would hash the password and create a new user in the database
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      const token = jwt.sign({ userId: user.id }, '3f8b13c7e1f5b6a8c3d2e4f5a6b7c8d9e0f123456789abcdeffedcba9876543210abcdef0123456789abcdefabcdef');

      return { ...user._doc, id: user._id, token };
    },

    async addNewEmployee(_, { first_name, last_name, email, gender, salary }) {
      // Create a new employee record in the database
      const employee = new Employee({
        first_name,
        last_name,
        email,
        gender,
        salary,
      });

      await employee.save();

      return employee;
    },

    async updateEmployeeByEid(_, { eid, first_name, last_name, email, gender, salary }) {
      // Update an employee's details using their employee ID (eid)
      return await Employee.findByIdAndUpdate(
        eid,
        { first_name, last_name, email, gender, salary },
        { new: true }
      );
    },

    async deleteEmployeeByEid(_, { eid }) {
      // Delete an employee record by their employee ID (eid)
      const employee = await Employee.findByIdAndRemove(eid);
      if (!employee) {
        throw new Error('Employee not found');
      }
      return employee;
    },
  },
};

module.exports = resolvers;
