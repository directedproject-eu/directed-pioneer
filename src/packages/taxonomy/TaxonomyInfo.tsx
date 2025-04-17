// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { useService } from "open-pioneer:react-hooks";
import { SetStateAction, useEffect, useState } from "react";
import { TaxonomyService, KeywordInfo } from "./TaxonomyService";
import {
    Spinner,
    Text, 
    Link, 
    Spacer, 
    Box, 
    CloseButton, 
    Button, 
    Flex
} from "@open-pioneer/chakra-integration";
import parse from "html-react-parser"; 

interface TaxonomyInfoProps {
    keyword: string;
}

interface TaxonomyInfoProps {
    keyword: string;
    onClose?: () => void;
}

export function TaxonomyInfo({ keyword, onClose }: TaxonomyInfoProps) {
    const taxonomyService = useService<TaxonomyService>("app.TaxonomyService");
    const [info, setInfo] = useState<KeywordInfo | null>(null);
    // const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    // const handleClick = async () => {
    //     if (!info) {
    //         setLoading(true);
    //         const data = await taxonomyService.getKeywordInfo(keyword);
    //         if (data) setInfo(data);
    //         setLoading(false);
    //     }
    //     // setShowPopup(prev => !prev);
    // };


    useEffect(() => {
        if (keyword) {
            setLoading(true);
            taxonomyService.fetchDescription(keyword).then((data: SetStateAction<KeywordInfo | null>) => {
                setInfo(data);
                setLoading(false);
            });
        }
    }, [keyword]);
    
    return (
        <Box
            width="sm"
            bg="white"
            maxHeight="150px"
            overflowY="auto"
            borderWidth="1px"
            borderRadius="md"
            p={4}
            boxShadow="md"
            position="relative"
        >
            <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="md" fontWeight="bold">
                    {keyword}
                </Text>
                {onClose && <CloseButton onClick={onClose} size="sm" />}
            </Flex>
            {!loading && info?.description && (
                <Text fontSize="sm" mb={2}>
                    {parse(info.description)}
                </Text>
            )}
            {!loading && !info?.description && (
                <Text fontSize="sm" color="gray.500" mb={2}>
                    No description available.
                </Text>
            )}
            <Spacer />
            <Link href="https://connectivity-hub.weadapt.org/" isExternal>
                <Button size="md" bg="#2e9ecc" color="white" variant="solid" mt={4}>
                    Search For More Terms
                </Button>
            </Link>
        </Box>
    );
}
