// let stepSize = 0.01;
// function areaFix() {
// 	stepSize *= 2.0;
//   const cols = 10;
//   const rows = 10;
// 	// first copy vertices
//   const V = translateVectorToTable(vector, targetTable, dims.height, dims.width);
// 	// Pos[][] V = new Pos[cols+1][rows+1];
// 	// for (int i = 0; i <= cols; i++) {
// 	// 	for (int j = 0; j <= rows; j++) V[i][j] = new Pos(verts[i][j]);
// 	// }
//   //
// 	// compute areas
//   const rects = getRectsFromTable(newTable);
//   const areas = rects.map(row => row.map(rect => signedArea(rect)));
//   // i'm not sure my intepretation of this is right?
// 	// if (areaTable == null) {
// 	// 	areaTable = new double[cols+1][rows+1];
// 	// 	for (int i = 0; i <= cols; i++) {
// 	// 		for (int j = 0; j <= rows; j++) {
// 	// 			if (i == 0 || j == 0) {
// 	// 				areaTable[i][j] = 0.0;
// 	// 			} else
// 	// 				{
// 	// 				areaTable[i][j] = areaTable[i-1][j] + areaTable[i][j-1] - areaTable[i-1][j-1] + cells[i-1][j-1].val;
// 	// 			}
// 	// 		}
// 	// 	}
// 	}

// 	// ArrayList<Pos> outer = new ArrayList<Pos>();
// 	// outer.add(verts[0][0]);
//   // outer.add(verts[cols][0]);
//   // outer.add(verts[cols][rows]);
//   // outer.add(verts[0][rows]);
//   //
// 	// Polygon outerQuad = new Polygon(outer);
// 	// double quadArea = Math.abs(outerQuad.getArea());
//   const quadArea = findSumForTable(areas);
//   const sumRatio = sumTrueArea / sumArea;
// 	double areaError = Double.MAX_VALUE;
// 	double scale = quadArea / areaTable[cols][rows];
// 	double[][] A = new double[cols][rows];
// 	for (int i = 0; i < cols; i++)
//     for (int j = 0; j < rows; j++)
//       A[i][j] = scale * cells[i][j].val;

// 	// correct areas
// 	int steps = 0;
// 	boolean done = false;
// 	//double AreaErr = Optimization.checkValid(V, A, areaError);
// 	double AreaErr = Optimization.computeFunction(V, A, false, true, false, false);
// 	Pos[][] AreaCor = Optimization.computeAreaCor2(V, A, true);

// 	while (!done && steps < 10) {
// 		for (int i = 0; i <= cols; i++) {
// 			for (int j = 0; j <= rows; j++) {
// 				V[i][j].x -= stepSize * AreaCor[i][j].x;
// 				V[i][j].y -= stepSize * AreaCor[i][j].y;
// 			}
// 		}
// 		double AE = Optimization.checkValid(V, A, areaError);
// 		if (AE < areaError && Optimization.computeFunction(V, A, false, true, false, false) < AreaErr) {
// 			done = true;
// 			for (int i = 0; i <= cols; i++) {
// 				for (int j = 0; j <= rows; j++) {
// 					V[i][j].x += 0.5 * stepSize * AreaCor[i][j].x;
// 					V[i][j].y += 0.5 * stepSize * AreaCor[i][j].y;
// 				}
// 			}
// 		}
// 		else {
// 			for (int i = 0; i <= cols; i++) {
// 				for (int j = 0; j <= rows; j++) {
// 					V[i][j].x += stepSize * AreaCor[i][j].x;
// 					V[i][j].y += stepSize * AreaCor[i][j].y;
// 				}
// 			}
// 			stepSize *= 0.5;
// 		}
// 		steps++;
// 	}

// 	// System.out.println(Optimization.checkValid(V, A, areaError));
//   console.log(checkValid(V, A, areaError))

// 	for (int i = 0; i <= cols; i++) {
// 		for (int j = 0; j <= rows; j++) {
// 			verts[i][j].x = V[i][j].x;
//       verts[i][j].y = V[i][j].y;
// 		}
// 	}

// }

// public static double checkValid(Pos[][] V, double[][] A, double error) {
//   int cols = V.length - 1;
//   int rows = V[0].length - 1;
//   double maxDiff = 0.0;
//   for (int i = 0; i < cols; i++) {
//     for (int j = 0; j < rows; j++) {
//       Polygon poly = new Polygon(V[i][j], V[i+1][j]);
//       poly.addPoint(V[i+1][j+1]);
// 			poly.addPoint(V[i][j+1]);
//       if (!poly.isCCWConvex()) {
// 				return error;
// 			}
//       if (Math.abs(A[i][j] + poly.getArea()) > error) {
// 				return error;
// 			}
//       maxDiff = Math.max(maxDiff, Math.abs(A[i][j] + poly.getArea()));
//     }
//   }
//   return maxDiff;
// }

// public static double computeFunction(
//   Pos[][] V, double[][] A, boolean areaRatio, boolean areaDev, boolean diagRatio, boolean minLength
// ) {
//   int cols = V.length - 1;
//   int rows = V[0].length - 1;
//   double F = 0.0;

//   // Area ratio: F = c1 * log(A1/A2)^2
//   if (areaRatio) {
//     for (int i = 0; i < cols; i++) {
//       for (int j = 0; j < rows; j++) {
//         double upLeft = V[i][j];
//         double upRght = V[i][j + 1];
//         double dnLeft = V[i + 1][j];
//         double dnRght = V[i + 1][j + 1];
//         double areaTR = 0.5 * (
//           (upRght.x - dnRght.x) * (dnLeft.y - dnRght.y) -
//           (upRght.y - dnRght.y) * (dnLeft.x - dnRght.x)
//         );
//         double areaLB = 0.5 * (
//           (dnLeft.x - upLeft.x) * (upRght.y - upLeft.y) -
//           (dnLeft.y - upLeft.y) * (upRght.x - upLeft.x)
//         );
//         double areaTL = 0.5 * (
//           (upLeft.x - upRght.x) * (dnRght.y - upRght.y) -
//           (upLeft.y - upRght.y) * (dnRght.x - upRght.x)
//         );
//         double areaRB = 0.5 * (
//           (dnRght.x - dnLeft.x) * (upLeft.y - dnLeft.y) -
//           (dnRght.y - dnLeft.y) * (upLeft.x - dnLeft.x)
//         );
//         if (areaTR <= 0.0 || areaLB <= 0.0 || areaTL <= 0.0 || areaRB <= 0.0)
//           console.log("NEGATIVE AREAS!");
//         F += CON_AREA_RATIO * Math.log(areaTR / areaLB) * Math.log(areaTR / areaLB);
//         F += CON_AREA_RATIO * Math.log(areaTL / areaRB) * Math.log(areaTL / areaRB);
//       }
//     }
//   }

//   // Area deviation: F = c2 * ((A - A0)/A0)^2
//   if (areaDev) {
//     for (int i = 0; i < cols; i++) {
//       for (int j = 0; j < rows; j++) {
//         double upLeft = V[i][j];
//         double upRght = V[i][j + 1];
//         double dnLeft = V[i + 1][j];
//         double dnRght = V[i + 1][j + 1];
//         double area = 0.5 * (
//           (dnRght.x - upLeft.x) * (upRght.y - dnLeft.y) -
//           (dnRght.y - upLeft.y) * (upRght.x - dnLeft.x)
//         );
//         double dA = (area - A[i][j]) / A[i][j];
//         F += CON_AREA_DEV * dA * dA;
//       }
//     }
//   }

//   // Diagonal ratio: F = c3 * log(D1/D2)^2
//   if (diagRatio) {
//     for (int i = 0; i < cols; i++) {
//       for (int j = 0; j < rows; j++) {
//         double upLeft = V[i][j];
//         double upRght = V[i][j + 1];
//         double dnLeft = V[i + 1][j];
//         double dnRght = V[i + 1][j + 1];
//         double L1 = upLeft.distToPoint(dnRght);
//         double L2 = dnLeft.distToPoint(upRght);
//         F += CON_DIAG_RATIO * Math.log(L1 / L2) * Math.log(L1 / L2);
//       }
//     }
//   }

//   // Min. length: F = c4 * log(1/L)^2
//   if (minLength) {
//     for (int i = 0; i <= cols; i++) {
//       for (int j = 0; j <= rows; j++) {
//         double upLeft = V[i][j];
//         double upRght = V[i][j + 1];
//         double dnLeft = V[i + 1][j];
//         // double dnRght = V[i + 1][j + 1];

//         if (i < cols) {
//           double L = upLeft.distToPoint(dnLeft);
//           F += CON_MIN_LEN * Math.log(L) * Math.log(L);
//         }
//         if (j < rows) {
//           double L = upLeft.distToPoint(upRght);
//           F += CON_MIN_LEN * Math.log(L) * Math.log(L);
//         }
//       }
//     }
//   }

//   return F;
// }

// public static Pos[][] computeAreaCor2(Pos[][] V, double[][] A, boolean normalize) {
//   int cols = V.length - 1;
//   int rows = V[0].length - 1;
//   double[][] M = new double[2 * (cols+1) * (rows+1)][4 + 2 * (cols+rows)];
//   double[] b = new double[4 + 2 * (cols+rows)];

//   fillConstraints(cols, rows, V, M, b, A, false);
//   double[][] Sol = linSolve(M, b);

//   double[] G = computeGrad(V, A, false, true, false, false);

//   double[] G2 = new double[G.length];
//   // project it
//   for (int j = 0; j < G2.length; j++) G2[j] = 0.0;
//   for (int i = 1; i < Sol.length; i++) {
//     double dot = 0.0;
//     for (int j = 0; j < G.length; j++) dot += G[j] * Sol[i][j];
//     for (int j = 0; j < G2.length; j++) G2[j] += dot * Sol[i][j];
//   }

//   Pos[][] AreaCor = new Pos[cols+1][rows+1];

//   for (int i = 0; i <= cols; i++) {
//     for (int j = 0; j <= rows; j++) {
//       AreaCor[i][j] = new Pos(G2[vToI(i, j, rows)], G2[vToI(i, j, rows)+1]);
//       if ((i == 0 || i == cols) && (j == 0 || j == rows)) {
//         AreaCor[i][j].x = 0.0; AreaCor[i][j].y = 0.0;
//       }
//     }
//   }

//   if (normalize) {
//     double L = 0.0;
//     for (int i = 0; i <= cols; i++) {
//       for (int j = 0; j <= rows; j++) {
//         L += AreaCor[i][j].x * AreaCor[i][j].x + AreaCor[i][j].y * AreaCor[i][j].y;
//       }
//     }
//     if (L > 0.0) {
//       L = 1.0 / Math.sqrt(L);
//       for (int i = 0; i <= cols; i++) {
//         for (int j = 0; j <= rows; j++) {
//           AreaCor[i][j].x *= L; AreaCor[i][j].y *= L;
//         }
//       }
//     }
//   }

//   return AreaCor;
// }

// public static double[] computeGrad(Pos[][] V, double[][] A, boolean areaRatio, boolean areaDev, boolean diagRatio, boolean minLength) {
// 	int cols = V.length - 1;
// 	int rows = V[0].length - 1;
// 	double[] G = new double[2 * (cols+1) * (rows+1)];
// 	for (int i = 0; i < G.length; i++) G[i] = 0.0;

// 	// Area ratio: F = c1 * log(A1/A2)^2
// 	if (areaRatio) {
// 		for (int i = 0; i < cols; i++) {
// 			for (int j = 0; j < rows; j++) {
// 				double upLeft = V[i][j];
// 				double upRght = V[i][j + 1];
// 				double dnLeft = V[i + 1][j];
// 				double dnRght = V[i + 1][j + 1];
// 				double areaTR = 0.5 * (
// 					(upRght.x - dnRght.x) * (dnLeft.y - dnRght.y) -
// 					(upRght.y - dnRght.y) * (dnLeft.x - dnRght.x)
// 				);
// 				double areaLB = 0.5 * (
// 					(dnLeft.x - upLeft.x) * (upRght.y - upLeft.y) -
// 					(dnLeft.y - upLeft.y) * (upRght.x - upLeft.x)
// 				);
// 				double areaTL = 0.5 * (
// 					(upLeft.x - upRght.x) * (dnRght.y - upRght.y) -
// 					(upLeft.y - upRght.y) * (dnRght.x - upRght.x)
// 				);
// 				double areaRB = 0.5 * (
// 					(dnRght.x - dnLeft.x) * (upLeft.y - dnLeft.y) -
// 					(dnRght.y - dnLeft.y) * (upLeft.x - dnLeft.x)
// 				);

// 				double f1 = 2.0 * CON_AREA_RATIO * Math.log(areaTR / areaLB);
// 				double f2 = 2.0 * CON_AREA_RATIO * Math.log(areaTL / areaRB);

// 				Pos dTRDi2j2 = dAreaDp1(dnRght, upRght, dnLeft);
// 				Pos dTRDij2 = dAreaDp2(dnRght, upRght, dnLeft);
// 				Pos dTRDi2j = dAreaDp3(dnRght, upRght, dnLeft);
// 				Pos dTRDij = new Pos(0.0, 0.0);

// 				Pos dLBDij = dAreaDp1(upLeft, dnLeft, upRght);
// 				Pos dLBDi2j = dAreaDp2(upLeft, dnLeft, upRght);
// 				Pos dLBDij2 = dAreaDp3(upLeft, dnLeft, upRght);
// 				Pos dLBDi2j2 = new Pos(0.0, 0.0);

// 				Pos dTLDij2 = dAreaDp1(upRght, upLeft, dnRght);
// 				Pos dTLDij = dAreaDp2(upRght, upLeft, dnRght);
// 				Pos dTLDi2j2 = dAreaDp3(upRght, upLeft, dnRght);
// 				Pos dTLDi2j = new Pos(0.0, 0.0);

// 				Pos dRBDi2j = dAreaDp1(dnLeft, dnRght, upLeft);
// 				Pos dRBDi2j2 = dAreaDp2(dnLeft, dnRght, upLeft);
// 				Pos dRBDij = dAreaDp3(dnLeft, dnRght, upLeft);
// 				Pos dRBDij2 = new Pos(0.0, 0.0);

// 				G[vToI(i, j, rows)] += f1 * (dTRDij.x / areaTR - dLBDij.x / areaLB) + f2 * (dTLDij.x / areaTL - dRBDij.x / areaRB);
// 				G[vToI(i, j, rows)+1] += f1 * (dTRDij.y / areaTR - dLBDij.y / areaLB) + f2 * (dTLDij.y / areaTL - dRBDij.y / areaRB);
// 				G[vToI(i+1, j, rows)] += f1 * (dTRDi2j.x / areaTR - dLBDi2j.x / areaLB) + f2 * (dTLDi2j.x / areaTL - dRBDi2j.x / areaRB);
// 				G[vToI(i+1, j, rows)+1] += f1 * (dTRDi2j.y / areaTR - dLBDi2j.y / areaLB) + f2 * (dTLDi2j.y / areaTL - dRBDi2j.y / areaRB);
// 				G[vToI(i, j+1, rows)] += f1 * (dTRDij2.x / areaTR - dLBDij2.x / areaLB) + f2 * (dTLDij2.x / areaTL - dRBDij2.x / areaRB);
// 				G[vToI(i, j+1, rows)+1] += f1 * (dTRDij2.y / areaTR - dLBDij2.y / areaLB) + f2 * (dTLDij2.y / areaTL - dRBDij2.y / areaRB);
// 				G[vToI(i+1, j+1, rows)] += f1 * (dTRDi2j2.x / areaTR - dLBDi2j2.x / areaLB) + f2 * (dTLDi2j2.x / areaTL - dRBDi2j2.x / areaRB);
// 				G[vToI(i+1, j+1, rows)+1] += f1 * (dTRDi2j2.y / areaTR - dLBDi2j2.y / areaLB) + f2 * (dTLDi2j2.y / areaTL - dRBDi2j2.y / areaRB);
// 			}
// 		}
// 	}

// 	// Area deviation: F = c2 * ((A - A0)/A0)^2
// 	if (areaDev) {
// 		for (int i = 0; i < cols; i++) {
// 			for (int j = 0; j < rows; j++) {
// 				double area = 0.5 * ((V[i+1][j+1].x - V[i][j].x) * (V[i][j+1].y - V[i+1][j].y) - (V[i+1][j+1].y - V[i][j].y) * (V[i][j+1].x - V[i+1][j].x));
// 				double fac = 2.0 * CON_AREA_DEV * (area - A[i][j]) / (A[i][j] * A[i][j]);
// 				Pos dADij = new Pos(0.5 * (V[i+1][j].y - V[i][j+1].y), 0.5 * (V[i][j+1].x - V[i+1][j].x));
// 				Pos dADi2j = new Pos(0.5 * (V[i+1][j+1].y - V[i][j].y), 0.5 * (V[i][j].x - V[i+1][j+1].x));
// 				Pos dADij2 = new Pos(0.5 * (V[i][j].y - V[i+1][j+1].y), 0.5 * (V[i+1][j+1].x - V[i][j].x));
// 				Pos dADi2j2 = new Pos(0.5 * (V[i][j+1].y - V[i+1][j].y), 0.5 * (V[i+1][j].x - V[i][j+1].x));
// 				G[vToI(i, j, rows)] += fac * dADij.x; G[vToI(i, j, rows)+1] += fac * dADij.y;
// 				G[vToI(i+1, j, rows)] += fac * dADi2j.x; G[vToI(i+1, j, rows)+1] += fac * dADi2j.y;
// 				G[vToI(i, j+1, rows)] += fac * dADij2.x; G[vToI(i, j+1, rows)+1] += fac * dADij2.y;
// 				G[vToI(i+1, j+1, rows)] += fac * dADi2j2.x; G[vToI(i+1, j+1, rows)+1] += fac * dADi2j2.y;
// 			}
// 		}
// 	}

// 	// Diagonal ratio: F = c3 * log(D1/D2)^2
// 	if (diagRatio) {
// 		for (int i = 0; i < cols; i++) {
// 			for (int j = 0; j < rows; j++) {
// 				double L1 = V[i][j].distToPoint(V[i+1][j+1]);
// 				double L2 = V[i+1][j].distToPoint(V[i][j+1]);
// 				double f1 = 2.0 * CON_DIAG_RATIO * Math.log(L1/L2) / (L1 * L1);
// 				double f2 = 2.0 * CON_DIAG_RATIO * Math.log(L2/L1) / (L2 * L2);
// 				G[vToI(i, j, rows)] += f1 * (V[i][j].x - V[i+1][j+1].x); G[vToI(i, j, rows)+1] += f1 * (V[i][j].y - V[i+1][j+1].y);
// 				G[vToI(i+1, j, rows)] += f2 * (V[i+1][j].x - V[i][j+1].x); G[vToI(i+1, j, rows)+1] += f2 * (V[i+1][j].y - V[i][j+1].y);
// 				G[vToI(i, j+1, rows)] += f2 * (V[i][j+1].x - V[i+1][j].x); G[vToI(i, j+1, rows)+1] += f2 * (V[i][j+1].y - V[i+1][j].y);
// 				G[vToI(i+1, j+1, rows)] += f1 * (V[i+1][j+1].x - V[i][j].x); G[vToI(i+1, j+1, rows)+1] += f1 * (V[i+1][j+1].y - V[i][j].y);
// 			}
// 		}
// 	}

// 	// Min. Length: F = c4 * log(1/L)^2
// 	if (minLength) {
// 		for (int i = 0; i <= cols; i++) {
// 			for (int j = 0; j <= rows; j++) {
// 				if (i < cols) {
// 					double L = V[i][j].distToPoint(V[i+1][j]);
// 					double fac = 2.0 * CON_MIN_LEN * Math.log(L) / (L * L);
// 					G[vToI(i, j, rows)] += fac * (V[i][j].x - V[i+1][j].x); G[vToI(i, j, rows)+1] += fac * (V[i][j].y - V[i+1][j].y);
// 					G[vToI(i+1, j, rows)] += fac * (V[i+1][j].x - V[i][j].x); G[vToI(i+1, j, rows)+1] += fac * (V[i+1][j].y - V[i][j].y);
// 				}
// 				if (j < rows) {
// 					double L = V[i][j].distToPoint(V[i][j+1]);
// 					double fac = 2.0 * CON_MIN_LEN * Math.log(L) / (L * L);
// 					G[vToI(i, j, rows)] += fac * (V[i][j].x - V[i][j+1].x); G[vToI(i, j, rows)+1] += fac * (V[i][j].y - V[i][j+1].y);
// 					G[vToI(i, j+1, rows)] += fac * (V[i][j+1].x - V[i][j].x); G[vToI(i, j+1, rows)+1] += fac * (V[i][j+1].y - V[i][j].y);
// 				}
// 			}
// 		}
// 	}

// 	return G;
// }
