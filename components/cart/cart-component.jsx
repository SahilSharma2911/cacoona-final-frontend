"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useCart from "@/hooks/use-cart";
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThreeCircles } from "react-loader-spinner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const CartComponent = () => {

  const router = useRouter();

  const searchParams =  useSearchParams();
  const { items, clearCart, incrementQuantity, decrementQuantity, loadCart } = useCart();

  const {data: session} = useSession();

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const email = session?.user?.email;


  useEffect(() => {
    if(searchParams.get("isBook")){
      clearCart(email)
      router.push("/")
      toast.success("download book")
    }
    if(searchParams.get("success")){
      clearCart(email)
      toast.success("Paymnet complete")
    }
    if(searchParams.get("cancelled")){
      toast.error("Payment cancelled")
    }
  },[searchParams, clearCart, email])




  useEffect(() => {
      if (session) {
        const email = session.user.email;
        loadCart(email);
      }
    }, [session, loadCart]);
  console.log("items in cart", items);

  
  const total = () => {
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.currentPrice * item.quantity;
    });
    return subtotal.toFixed(2);
  };

  const onCheckout = async () => {
    try {
      setIsCheckoutLoading(true);
      const productData = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));


      const res = await axios.post(
        "https://cacoona-admin.vercel.app/api/checkout",
        {
          productData,
          email
        }
      );

      window.location = res.data.url;
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[80px_1fr_1fr_1fr] items-center gap-4 border-b pb-4"
            >
              <div>
                <img
                  alt="Product Image"
                  className="rounded-md"
                  height={80}
                  src={item.imageSrc || "/placeholder.svg"}
                  style={{
                    aspectRatio: "80/80",
                    objectFit: "cover",
                  }}
                  width={80}
                />
              </div>
              <div>
                <h3 className="font-medium">{item.productName}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${item.currentPrice}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  onClick={() => decrementQuantity(item.id, email)}
                  size="icon"
                  variant="outline"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span>{item.quantity}</span>
                <Button
                  onClick={() => incrementQuantity(item.id, email)}
                  size="icon"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p>Total</p>
            <p className="font-medium text-primary">${total()}</p>
          </div>
          <Button onClick={() => clearCart(email)} className="w-full">
            Empty cart
          </Button>
          {
            isCheckoutLoading ? <div className="flex items-center justify-center">
              <ThreeCircles   height="30"
                width="100" color="#000" />
            </div> : <Button className="w-full" onClick={() => onCheckout()}>
            Proceed to Checkout
          </Button>
          }
          
          <Link
            className="inline-block text-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            href="#"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

function MinusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export default CartComponent;
