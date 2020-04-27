import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('No suficient funds for this transaction!');
    }

    let categoryTuple = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryTuple) {
      categoryTuple = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryTuple);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryTuple,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
