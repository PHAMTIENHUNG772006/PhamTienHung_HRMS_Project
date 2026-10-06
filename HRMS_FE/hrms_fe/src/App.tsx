import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store'; // Import default chuẩn (không có dấu ngoặc nhọn {})
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Provider store={store}> {/* TRUYỀN TRỰC TIẾP BIẾN store - TUYỆT ĐỐI KHÔNG DÙNG store() */}
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;