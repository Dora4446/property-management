import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Property } from '../models/Property';
import { Payment } from '../models/Payment';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getExpenses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, propertyId, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (propertyId) query.propertyId = propertyId;

    if (req.user?.role === 'PROPERTY_OWNER') {
      const ownedProperties = await Property.find({ ownerId: req.user.id }).select('_id');
      const propIds = ownedProperties.map((p) => p._id);
      query.propertyId = { $in: propIds };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('propertyId', 'title address city')
        .populate('createdBy', 'name email')
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Expense.countDocuments(query),
    ]);

    return sendSuccess(res, 'Expenses fetched successfully', expenses, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch expenses', null, 500);
  }
};

export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId, category, title, amount, expenseDate, paidTo, paymentMethod, notes } = req.body;

    const expense = new Expense({
      propertyId,
      category,
      title,
      amount,
      expenseDate: expenseDate || new Date(),
      paidTo,
      paymentMethod: paymentMethod || 'Net Banking',
      notes,
      createdBy: req.user?.id,
    });

    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('propertyId', 'title address city')
      .populate('createdBy', 'name');

    return sendSuccess(res, 'Expense recorded successfully', populated, undefined, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create expense', null, 500);
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return sendError(res, 'Expense record not found', null, 404);
    }
    return sendSuccess(res, 'Expense deleted successfully', { id: req.params.id });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete expense', null, 500);
  }
};

export const getFinancialSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let propertyQuery: any = {};
    if (req.user?.role === 'PROPERTY_OWNER') {
      const owned = await Property.find({ ownerId: req.user.id }).select('_id');
      propertyQuery = { propertyId: { $in: owned.map((p) => p._id) } };
    }

    const [payments, expenses] = await Promise.all([
      Payment.find({ ...propertyQuery, status: 'Paid' }),
      Expense.find(propertyQuery),
    ]);

    const totalIncome = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Breakdown by category
    const expenseByCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    });

    return sendSuccess(res, 'Financial summary calculated successfully', {
      totalIncome,
      totalExpenses,
      netIncome,
      currency: 'INR (₹)',
      expenseByCategory,
      totalTransactions: payments.length + expenses.length,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to calculate financial summary', null, 500);
  }
};
