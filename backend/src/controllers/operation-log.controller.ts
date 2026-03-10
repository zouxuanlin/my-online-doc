import { Request, Response } from 'express';
import * as operationLogService from '../services/operation-log.service';

// 获取用户的操作日志
export const getUserLogs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { page, pageSize, action, entityType, entityId, startDate, endDate } = req.query;

    const result = await operationLogService.getUserLogs(user.userId, {
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
      action: action as operationLogService.ActionType,
      entityType: entityType as operationLogService.EntityType,
      entityId: entityId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      code: 'SUCCESS',
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

// 获取文档的操作日志
export const getDocumentLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const logs = await operationLogService.getEntityLogs(
      operationLogService.EntityType.DOCUMENT,
      id,
      parseInt(limit as string)
    );

    res.json({
      code: 'SUCCESS',
      data: { logs },
    });
  } catch (error) {
    throw error;
  }
};
