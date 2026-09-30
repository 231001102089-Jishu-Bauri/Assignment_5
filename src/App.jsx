import React, { createContext, useContext, useReducer, useState } from "react";
import "./App.css";

const CartContext = createContext();

const products = [
  {
    id: 1,
    name: "Apple iPhone 15",
    price: 69999,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "MacBook Air",
    price: 99999,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Sony Headphones",
    price: 7999,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Apple Watch",
    price: 39999,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Canon Camera",
    price: 54999,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Nike Shoes",
    price: 5999,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
  },
];

const initialState = {
  cart: [],
  discount: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existing = state.cart.find(
        (item) => item.id === action.payload.id
      );

      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case "APPLY_COUPON":
      return {
        ...state,
        discount: action.payload,
      };

    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (product) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: product,
    });
  };

  const removeItem = (id) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: id,
    });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        id,
        quantity: Number(quantity),
      },
    });
  };

  const applyCoupon = (code) => {
    const coupons = {
      SAVE10: 10,
      SAVE20: 20,
      SAVE30: 30,
    };

    const discount = coupons[code.toUpperCase()] || 0;

    dispatch({
      type: "APPLY_COUPON",
      payload: discount,
    });

    return discount;
  };

  const subtotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountAmount = (subtotal * state.discount) / 100;

  const afterDiscount = subtotal - discountAmount;

  const gst = (afterDiscount * 18) / 100;

  const grandTotal = afterDiscount + gst;

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeItem,
        updateQuantity,
        applyCoupon,
        subtotal,
        discountAmount,
        gst,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return useContext(CartContext);
}

function ProductList() {
  const { addToCart } = useCart();

  return (
    <section className="products-section">
      <div className="section-heading">
        <div>
          <p className="small-title">OUR COLLECTION</p>
          <h2>Featured Products</h2>
        </div>

        <span>{products.length} Products</span>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image-container">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-info">
              <h3>{product.name}</h3>

              <div className="product-bottom">
                <strong>
                  ₹{product.price.toLocaleString("en-IN")}
                </strong>

                <button
                  className="add-button"
                  onClick={() => addToCart(product)}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShoppingCart() {
  const {
    cart,
    discount,
    subtotal,
    discountAmount,
    gst,
    grandTotal,
    removeItem,
    updateQuantity,
    applyCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const handleCoupon = () => {
    const result = applyCoupon(couponCode);

    if (result > 0) {
      setCouponMessage(`${result}% discount applied!`);
    } else {
      setCouponMessage("Invalid coupon code");
    }
  };

  return (
    <section className="cart-section">
      <div className="cart-header">
        <div>
          <p className="small-title">YOUR BAG</p>
          <h2>Shopping Cart</h2>
        </div>

        <span className="cart-count">
          {cart.reduce((total, item) => total + item.quantity, 0)} Items
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started.</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>
                    ₹{item.price.toLocaleString("en-IN")} each
                  </p>

                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-price">
                  <strong>
                    ₹
                    {(item.price * item.quantity).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <button
                    className="remove-button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary">
            <h2>Order Summary</h2>

            <div className="coupon">
              <label>Coupon Code</label>

              <div className="coupon-input">
                <input
                  type="text"
                  placeholder="SAVE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />

                <button onClick={handleCoupon}>Apply</button>
              </div>

              {couponMessage && (
                <p className="coupon-message">{couponMessage}</p>
              )}

              <small>
                Try SAVE10, SAVE20 or SAVE30
              </small>
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>
                ₹{subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="summary-line discount">
              <span>Discount ({discount}%)</span>
              <strong>
                -₹{discountAmount.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="summary-line">
              <span>GST (18%)</span>
              <strong>₹{gst.toLocaleString("en-IN")}</strong>
            </div>

            <div className="divider"></div>

            <div className="grand-total">
              <span>Grand Total</span>
              <strong>
                ₹{grandTotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <button className="checkout-button">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function App() {
  return (
    <CartProvider>
      <div className="app">
        <header className="navbar">
          <div className="logo">
            Shop<span>Cart</span>
          </div>

          <div className="nav-title">
            Online Shopping Cart
          </div>

          <div className="cart-icon">🛒</div>
        </header>

        <main>
          <div className="hero">
            <p>WELCOME TO SHOPCART</p>
            <h1>Everything You Need,<br />All in One Place.</h1>
            <span>
              Discover our collection of premium products.
            </span>
          </div>

          <ProductList />

          <ShoppingCart />
        </main>

        <footer>
          <p>© 2026 ShopCart • Online Shopping Cart</p>
        </footer>
      </div>
    </CartProvider>
  );
}

export default App;