import Header from "./Header";
import Footer from "./Footer";

// Layout.jsx
export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header></Header>
        <main>{children}</main>
      <Footer></Footer>
    </div>
  );
};
