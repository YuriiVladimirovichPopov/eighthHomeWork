import request  from "supertest"
import { app } from '../settings'
import { authorizationValidation } from "../middlewares/input-validation-middleware";
import { sendStatus } from "../routers/send-status";
import { body } from "express-validator";

const getRequest = () => {
  return request(app)
}

describe('Tests for /posts/:postId/comments', () => {

  beforeAll(async () => {
    await getRequest()
    .delete('/testing/all-data')
})
  
beforeAll(async () => {
    authorizationValidation 
})

  it('should return 404 when trying to get comments for a non-existent post', async () => {
    await getRequest()
    .get('/posts/nonExistentPostId/comments')
    .expect(sendStatus.NOT_FOUND_404);
  })

  it('should return a list of comments when getting comments for an existing post', async () => {
    await getRequest()
    .get('/posts/:postId/comments')
    .expect(sendStatus.NOT_FOUND_404)
    expect(body)
    .toEqual(expect.any(Array))
  })

  it(`shouldn't update a comment for a non-existent post`, async () => {
    await getRequest()
    .put('/posts/nonExistentPostId/comments')
    .send({});
    expect(sendStatus.NOT_FOUND_404);
  })

  it('should update a comment for an existing post', async () => {
    await getRequest()
      .put('/posts/existingPostId/comments')
      .send({})
    expect(sendStatus.CREATED_201)
    expect(body).toEqual(expect.objectContaining({}));
  })

  it('should delete a comment', async () => {
    const response = await request(app)
      .delete('/comments/commentId') // Замените 'commentId' на действительный ID комментария
      .set('Authorization', 'Bearer'); // Установите ваш токен авторизации здесь
    expect(response.status).toBe(sendStatus.NO_CONTENT_204);
    // Здесь можно добавить дополнительные проверки, если необходимо.
  });
})
