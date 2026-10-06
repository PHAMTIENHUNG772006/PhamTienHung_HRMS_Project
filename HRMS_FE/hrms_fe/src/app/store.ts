import { configureStore } from '@reduxjs/toolkit';

// Tạo một reducer tạm thời để Redux Toolkit không bị báo lỗi trống
const temporaryReducer = (state = {}) => state;

const store = configureStore({
  reducer: {
    temp: temporaryReducer, // Reducer hợp lệ giúp store hoạt động ổn định
    // Sau này bạn thêm các slice thực tế vào đây, ví dụ: auth: authReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; // Xuất ra đối tượng store hoàn chỉnh (Default Export)