export type Product = {
    id: number;
    photoUrl: string;
    title: string;
    category: string;
    description: string;
    salePrice: number | null;
    price: number;
}

export type CartItem = Product & {
    count: number;
}

export type SlideItem = {
    id: number;
    url: string;
    title: string;
}
