const test = async () => {
  const Redis = require('ioredis');
  // redis实例(传入配置)
  const redis = new Redis({
    port: 6379,
  });
  await redis.set('name', 'song');
  /**
   * @param 10 秒/ 打开命令行 用get测试是否成功定时删除
   */
  await redis.setex('age', 10, 'song');
  // 链接数据库，是异步的操作
  const keys = await redis.keys('*');
  console.log(keys);
};
test();
