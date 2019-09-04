import { Spin } from 'antd';
export default () => {
  return (
    <div className='root'>
      <Spin />
      <style jsx>
        {`
          .root {
            position: fixed;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>
    </div>
  );
};
