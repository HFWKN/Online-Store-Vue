import request from "@/utils/request"

//展示商品分类信息
export const categoryList = () => request.get('/product/category/list')