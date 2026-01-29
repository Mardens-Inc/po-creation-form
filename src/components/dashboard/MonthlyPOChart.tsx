import {Card, CardBody, CardHeader} from "@heroui/react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import {motion} from "framer-motion";
import {MOCK_MONTHLY_DATA} from "../../data/mock-pos.ts";

const CURRENT_MONTH_INDEX = new Date().getMonth();

export function MonthlyPOChart() {
    const data = MOCK_MONTHLY_DATA.map((d, i) => ({
        ...d,
        fill: i === CURRENT_MONTH_INDEX ? "#fec60b" : "#ec2b37",
    }));

    return (
        <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.3}}
        >
            <Card shadow="sm">
                <CardHeader className="pb-0 px-6 pt-5">
                    <h2 className="font-headers font-bold text-lg">Purchase Orders by Month</h2>
                </CardHeader>
                <CardBody className="px-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{top: 10, right: 20, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                            <XAxis dataKey="month" tick={{fontSize: 12}}/>
                            <YAxis tick={{fontSize: 12}}/>
                            <Tooltip
                                contentStyle={{backgroundColor: "#0f0f12", border: "none", borderRadius: "8px", color: "#fff"}}
                                labelStyle={{color: "#fff"}}
                                itemStyle={{color: "#fff"}}
                            />
                            <Bar dataKey="count" name="POs" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>
        </motion.div>
    );
}
