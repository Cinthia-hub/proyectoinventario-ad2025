erDiagram
    CATEGORY ||--|{ PRODUCT : contains
    PRODUCT ||--|{ SALE_DETAIL : sold_in
    SALE ||--|{ SALE_DETAIL : includes
    USER ||--|{ SALE : processes

    CATEGORY {
        int id
        string name
    }

    PRODUCT {
        int id
        string name
        float price
        int stock
        int categoryId
    }

    SALE {
        int id
        datetime date
        float total
        int userId
    }

    SALE_DETAIL {
        int id
        int saleId
        int productId
        int quantity
        float subtotal
    }

    USER {
        int id
        string username
        string password
        string role
    }