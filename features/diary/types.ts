export type DiaryFlowerResponse = {
  flowerId: string;
  responderId: string;
  createdAt?: string;
  updatedAt: string;
};

export type DiaryGardenFlower = {
  entryId: string;
  flowerId: string;
  plantedAt: string;
};

export type DiaryEntry = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  publishedAt: string;
  expiresAt: string;
  updatedAt: string;
  isOwn: boolean;
  isActive: boolean;
  flowerResponse?: DiaryFlowerResponse;
};
