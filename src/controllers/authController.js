import { ulid } from 'ulid';
import { hash, compare } from 'bcrypt';
import { redisClient } from '../db/index.js';
import { generateToken } from '../utils/jwtHelper.js';

const createAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, displayName } = req.body;

    const userId = ulid(); 

    const userEmail = await redisClient.hgetall(`user:${email}`);

    if (userEmail.email === email) {
    return res.status(409).send({
        error: true,
        message: 'Account with that email already exists',
        data: '',
      });
    }

    const hashedPassword = await hash(password, 10);
    const createUser = await redisClient.execute([
      'HSET',
      `user:${email}`,
      'id',
      `${userId}`,
      'firstName',
      `${firstName}`,
      'lastName',
      `${lastName}`,
      'email',
      `${email}`,
      'password',
      `${hashedPassword}`,
      'displayName',
      `${displayName}`,
    ]);

    const token = await generateToken({ userKey: `user:${email}`, userId })

    if (createUser && typeof createUser === 'number') {
      return res.status(201).send({
        error: false,
        message: 'Account succesfully created',
        data: { token },
      });
    }
  } catch (error) {
    return res.status(500).send({
      error: true,
      message: `Server error, please try again later. ${error}`
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { firstName, lastName, email, password, displayName } = req.body;

    const user = await redisClient.hgetall(`user:${req.params.email}`);

    if (!user) {
      return res.status(404).send({
        error: true,
        message: 'User not found.',
        data: user,
      });
    }

    const hashedPassword = await hash(password, 10);

    const updateUser = await redisClient.execute([
      'HSET',
      `user:${email}`,
      'firstName',
      `${firstName}`,
      'lastName',
      `${lastName}`,
      'email',
      `${email}`,
      'password',
      `${hashedPassword}`,
      'displayName',
      `${displayName}`,
    ]);

    if (updateUser && typeof updateUser === 'number') {
      return res.status(201).send({
        error: false,
        message: 'User succesfully updated'
      });
    }
  } catch (error) {
    return res.status(500).send({
      error: true,
      message: `Server error, please try again later. ${error}`
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await redisClient.execute(['DEL', `user:${email}`]);
    if (!user) {
      return res.status(404).send({
        error: true,
        message: 'User not found.',
        data: user,
      });
    }

    return res.status(200).send({
      error: false,
      message: 'User deleted successfylly',
      data: { entityId: email },
    });
  } catch (error) {
    return res.status(500).send({
      error: true,
      message: `Server error, please try again later. ${error}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await redisClient.hgetall(`user:${email}`);

    const validaPassword = await compare(password, user.password);

    if (!user.email || !validaPassword) {
      return res.status(401).send({
        error: true,
        message: 'Invlaid email or password',
      });
    }

    const token = await generateToken({ userKey: `user:${email}`, userId: user.id })

    return res.status(200).send({
      error: false,
      message: 'Login successfully',
      data: { token },
    });
  } catch (error) {
    return `Server error, please try again later. ${error}`;
  }
};

export { createAccount, updateAccount, deleteAccount, login };
