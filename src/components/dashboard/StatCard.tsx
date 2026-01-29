import {Card, CardBody} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {motion} from "framer-motion";

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    index: number;
}

export function StatCard({title, value, icon, index}: StatCardProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: index * 0.1}}
        >
            <Card shadow="sm">
                <CardBody className="flex flex-row items-center gap-4 p-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                        <Icon icon={icon} width={28} height={28}/>
                    </div>
                    <div>
                        <p className="text-sm text-default-500 font-text">{title}</p>
                        <p className="text-2xl font-headers font-black">{value}</p>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}
