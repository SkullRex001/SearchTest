import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";

export const getAllCustomersWithoutPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search = "",

      // ✅ ONLY VALID SORT OPTIONS
      sortBy = "customerName", // customerName | quantity
      order = "asc",

      // CUSTOMER
      gender,
      region,
      customerType,
      minAge,
      maxAge,

      // PRODUCT
      productName,
      brand,
      category,
      tags,

      // SALES
      paymentMethod,
      orderStatus,
      deliveryType,
      startDate,
      endDate,
      minQuantity,
      maxQuantity,
      minDiscountPercentage,
      maxDiscountPercentage,
      minTotalAmount,
      maxTotalAmount,
      minFinalAmount,
      maxFinalAmount,

      // STORE & EMPLOYEE
      storeLocation,
      employeeName
    } = req.query as Record<string, string>;

    // ✅ CUSTOMER FILTERS
    const andFilters: Prisma.CustomerWhereInput[] = [];

    // 🔍 SEARCH
    if (search) {
      andFilters.push({
        OR: [
          {
            customerName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          },
          {
            phoneNumber: {
              contains: search,
              mode: Prisma.QueryMode.insensitive
            }
          }
        ]
      });
    }

    if (gender) andFilters.push({ gender: { in: gender.split(",") } });
    if (region) andFilters.push({ region: { in: region.split(",") } });
    if (customerType) andFilters.push({ customerType });

    if (minAge || maxAge) {
      const ageFilter: Prisma.IntFilter<"Customer"> = {};
      if (minAge) ageFilter.gte = Number(minAge);
      if (maxAge) ageFilter.lte = Number(maxAge);
      andFilters.push({ age: ageFilter });
    }

    // ✅ SALES + PRODUCT + STORE + EMPLOYEE FILTERS
    const salesAndFilters: Prisma.SaleWhereInput[] = [];

    if (paymentMethod) salesAndFilters.push({ paymentMethod });
    if (orderStatus) salesAndFilters.push({ orderStatus });
    if (deliveryType) salesAndFilters.push({ deliveryType });

    if (startDate || endDate) {
      const dateFilter: Prisma.DateTimeFilter<"Sale"> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      salesAndFilters.push({ date: dateFilter });
    }

    if (minQuantity || maxQuantity) {
      const q: Prisma.IntFilter<"Sale"> = {};
      if (minQuantity) q.gte = Number(minQuantity);
      if (maxQuantity) q.lte = Number(maxQuantity);
      salesAndFilters.push({ quantity: q });
    }

    if (minDiscountPercentage || maxDiscountPercentage) {
      const d: Prisma.FloatFilter<"Sale"> = {};
      if (minDiscountPercentage) d.gte = Number(minDiscountPercentage);
      if (maxDiscountPercentage) d.lte = Number(maxDiscountPercentage);
      salesAndFilters.push({ discountPercentage: d });
    }

    if (minTotalAmount || maxTotalAmount) {
      const t: Prisma.FloatFilter<"Sale"> = {};
      if (minTotalAmount) t.gte = Number(minTotalAmount);
      if (maxTotalAmount) t.lte = Number(maxTotalAmount);
      salesAndFilters.push({ totalAmount: t });
    }

    if (minFinalAmount || maxFinalAmount) {
      const f: Prisma.FloatFilter<"Sale"> = {};
      if (minFinalAmount) f.gte = Number(minFinalAmount);
      if (maxFinalAmount) f.lte = Number(maxFinalAmount);
      salesAndFilters.push({ finalAmount: f });
    }

    if (productName || brand || category || tags) {
      const productFilter: Prisma.ProductWhereInput = {};
      if (productName) productFilter.productName = productName;
      if (brand) productFilter.brand = brand;
      if (category) productFilter.category = category;
      if (tags) productFilter.tags = tags;

      salesAndFilters.push({ product: productFilter });
    }

    if (storeLocation) {
      salesAndFilters.push({
        store: { location: storeLocation }
      });
    }

    if (employeeName) {
      salesAndFilters.push({
        employee: { employeeName }
      });
    }

    if (salesAndFilters.length > 0) {
      andFilters.push({
        sales: {
          some: {
            AND: salesAndFilters
          }
        }
      });
    }

    // ✅ FINAL WHERE
    const whereClause: Prisma.CustomerWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {};

    // ✅ FINAL SORTING
    let orderBy: Prisma.CustomerOrderByWithRelationInput;

    if (sortBy === "customerName") {
      orderBy = { customerName: order as "asc" | "desc" };
    } else if (sortBy === "quantity") {
      orderBy = { sales: { _count: order as "asc" | "desc" } };
    } else {
      orderBy = { customerName: "asc" };
    }

    // ✅ FETCH ALL CUSTOMERS (NO PAGINATION)
    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy,
      include: {
        sales: {
          include: {
            product: true,
            store: true,
            employee: true
          }
        }
      }
    });

    res.json({
      success: true,
      totalRecords: customers.length,
      data: customers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
