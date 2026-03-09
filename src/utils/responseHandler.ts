import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: string
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  });
};
