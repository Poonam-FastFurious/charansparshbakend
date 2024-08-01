import { Router } from 'express';
import {
  addReview,
  deleteReview,
  getReviews
} from './review.controller.js';

const router = Router();

router.route('/getreviews').get(getReviews)
router.route('/addreview').post(addReview);
router.route('/reviews/:id').delete(deleteReview);

export default router;