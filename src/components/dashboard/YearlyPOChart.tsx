import {Card, CardBody, CardHeader} from "@heroui/react";
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import {motion} from "framer-motion";
import {usePurchaseOrdersContext} from "../../providers/PurchaseOrdersProvider.tsx";

export function YearlyPOChart() {
    const {getYearlyData} = usePurchaseOrdersContext();
    const yearlyData = getYearlyData();
    return (
        <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.3}}
        >
            <Card shadow="sm">
                <CardHeader className="pb-0 px-6 pt-5">
                    <h2 className="font-headers font-bold text-lg">Purchase Orders by Year</h2>
                </CardHeader>
                <CardBody className="px-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={yearlyData} margin={{top: 10, right: 20, left: 0, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec2b37" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ec2b37" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                            <XAxis dataKey="year" tick={{fontSize: 12}}/>
                            <YAxis tick={{fontSize: 12}}/>
                            <Tooltip
                                contentStyle={{backgroundColor: "#0f0f12", border: "none", borderRadius: "8px", color: "#fff"}}
                                labelStyle={{color: "#fff"}}
                                itemStyle={{color: "#fff"}}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="POs"
                                stroke="#ec2b37"
                                strokeWidth={2}
                                fill="url(#colorCount)"
                                activeDot={{r: 6, fill: "#fec60b", stroke: "#fec60b"}}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </motion.div>
    );
}
