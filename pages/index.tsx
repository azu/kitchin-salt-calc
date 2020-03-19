import Head from "next/head";
import React, { useRef, useState } from "react";
import {
    Flex,
    FormControl,
    FormLabel,
    NumberInput,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    ThemeProvider
} from "@chakra-ui/core";
import { Button, Text, Textarea } from "@chakra-ui/core/dist";
import { useLocalStorage } from "../src/hooks/use-localStorage";

type SettingTextAreaProps = {
    jsonValue: {};
    handleChange: (jsonValue: Settings) => void;
};
const SettingTextArea = (props: SettingTextAreaProps) => {
    const [invalid, setInvalid] = useState<boolean>();
    const refHTMLTextAreaElement = useRef<HTMLTextAreaElement>(null);
    const [textAreaValue, setTextAreaValue] = useState<string>(JSON.stringify(props.jsonValue));
    const handleTextAreaChange = (event: React.ChangeEvent<any>) => {
        const inputValue: string = event.currentTarget.value;
        setTextAreaValue(inputValue);
        try {
            JSON.parse(inputValue);
            setInvalid(false);
        } catch (error) {
            console.log(error.message);
            setInvalid(true);
        }
    };
    const handleSaveClick = () => {
        const inputValue: string | undefined = refHTMLTextAreaElement.current?.value;
        if (!inputValue) {
            return;
        }
        setTextAreaValue(inputValue);
        try {
            const json = JSON.parse(inputValue);
            props.handleChange(json);
            setInvalid(false);
        } catch (error) {
            setInvalid(true);
        }
    };
    return (
        <>
            <Text mb="8px">設定データ(JSON)</Text>
            <Textarea
                isInvalid={invalid}
                value={textAreaValue}
                ref={refHTMLTextAreaElement}
                onChange={handleTextAreaChange}
                placeholder={`{
    "塩分濃度": 0.6,
    "調味料": [
        {
            "名前": "塩",
            "ふりがな": "しお",
            "食塩相当量": 100
        },
        {
            "名前": "めんつゆ",
            "ふりがな": "めんつゆ",
            "食塩相当量": 16.0
        },
        {
            "名前": "コンソメ",
            "ふりがな": "こんそめ",
            "食塩相当量": 2.5
        }
    ],
    "容器": [
        {
            "名前": "ホットクック内鍋",
            "ふりがな": "ホットクック",
            "重さ": 562
        },
        {
            "名前": "ボール1",
            "ふりがな": "ぼーるいち",
            "重さ": 180
        },
        {
            "名前": "ボール2",
            "ふりがな": "ぼーるに",
            "重さ": 280
        },
        {
            "名前": "ボール3",
            "ふりがな": "ぼーるさん",
            "重さ": 500
        },
        {
            "名前": "ボール4",
            "ふりがな": "ぼーるよん",
            "重さ": 700
        },
        {
            "名前": "ボール5",
            "ふりがな": "ぼーるご",
            "重さ": 1000
        }
    ]
}`}
                size="sm"
            />
            <Button variantColor="green" onClick={handleSaveClick}>
                Save
            </Button>
        </>
    );
};
const calcConcentrationOfSalt = (
    inputG: number,
    containerG: number,
    食塩相当量g: number,
    options: { 塩分濃度: number } = {
        塩分濃度: 0.6
    }
) => {
    const 塩分 = options.塩分濃度 / 食塩相当量g;
    return `${((inputG - containerG) * 塩分).toFixed(2)}g`;
};
type SliderInputProps = {
    inputId: string;
    className?: string;
    value: number;
    handleChange: (value: number) => void;
};
const SliderInput = (props: SliderInputProps) => {
    const handleChange = (value: any) => {
        return props.handleChange(Number(value));
    };
    return (
        <Flex className={props.className}>
            <NumberInput
                id={props.inputId}
                maxW="100px"
                mr="2rem"
                value={props.value}
                min={0}
                max={3000}
                onChange={handleChange}
            />
            <Slider flex="1" value={props.value} onChange={props.handleChange} min={0} max={3000}>
                <SliderTrack />
                <SliderFilledTrack />
                <SliderThumb
                    defaultValue={props.value}
                    fontSize="sm"
                    width="32px"
                    height="20px"
                    children={props.value}
                />
            </Slider>
        </Flex>
    );
};

type Settings = {
    塩分濃度: number;
    調味料: {
        名前: string;
        ふりがな: string;
        食塩相当量: number;
    }[];
    容器: {
        名前: string;
        ふりがな: string;
        重さ: number;
    }[];
};
type DataTableProps = {
    input: number;
    settings: Settings;
};
const DataTable = (props: DataTableProps) => {
    const headers = [
        <th data-type="item-container" key={"_入れ物_"}>
            入れ物
        </th>
    ].concat(
        props.settings["調味料"].map(item => {
            return (
                <th data-type="text-short" key={item["名前"]}>
                    {item["名前"]}
                </th>
            );
        })
    );
    return (
        <table className={"main-table"}>
            <thead>
                <tr>{headers}</tr>
            </thead>
            <tbody>
                {props.settings["容器"]
                    .filter(container => {
                        return props.input > container["重さ"];
                    })
                    .map(container => {
                        return (
                            <tr key={container["名前"]}>
                                <td data-type="item-container">{container["名前"]}</td>
                                {props.settings["調味料"].map(relishItem => {
                                    return (
                                        <td key={container["重さ"] + relishItem["名前"]}>
                                            {calcConcentrationOfSalt(
                                                props.input,
                                                container["重さ"],
                                                relishItem["食塩相当量"],
                                                {
                                                    塩分濃度: props.settings["塩分濃度"]
                                                }
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
            </tbody>
        </table>
    );
};

type Query = {
    weight: number;
};

function useQuery(initialValue: Query) {
    if (!process.browser) {
        return initialValue;
    }
    const parseWeight = (weightQuery?: string | null) => {
        if (!weightQuery) {
            return null;
        }
        const match = weightQuery.match(/(\d+)/);
        if (match) {
            return match[1];
        }
        return null;
    };
    try {
        const url = new URL(location.href);
        const weight = parseWeight(url.searchParams.get("weight"));
        return {
            weight: weight ? Number(weight) : initialValue.weight
        };
    } catch (error) {
        console.error(error);
        return initialValue;
    }
}

const Home = () => {
    const query = useQuery({
        weight: 1250
    });
    const [input, setInput] = useState<number>(query.weight);
    const handleInputChange = (value: number) => {
        if (Number.isNaN(value)) {
            return;
        }
        setInput(value);
    };
    const [settingsValue, setSettingsValue] = useLocalStorage<Settings>("settings", {
        塩分濃度: 0.6,
        調味料: [],
        容器: []
    });
    const settingsValueWithDefault: Settings = {
        塩分濃度: settingsValue["塩分濃度"],
        調味料: settingsValue["調味料"],
        容器: [
            {
                名前: "なし",
                ふりがな: "なし",
                重さ: 0
            }
        ].concat(settingsValue["容器"])
    };
    const handleSettingsChange = (jsonValue: Settings) => {
        setSettingsValue(jsonValue);
    };
    return (
        <div className="container">
            <Head>
                <title>キッチン塩分計算機</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={"main"}>
                <h1>キッチン塩分計算機</h1>
                <FormControl className={"main-inputContainer"} as="fieldset">
                    <FormLabel className={"main-inputLabel"} htmlFor={"main-input"} as="legend">
                        材料の重さ(g)
                    </FormLabel>
                    <SliderInput
                        inputId={"main-input"}
                        className={"main-input"}
                        value={input}
                        handleChange={handleInputChange}
                    />
                </FormControl>
                <DataTable input={input} settings={settingsValueWithDefault} />
                <SettingTextArea jsonValue={settingsValue} handleChange={handleSettingsChange} />
            </main>

            <footer>
                <a href="https://github.com/azu/kitchin-salt-calc" target="_blank" rel="noopener noreferrer">
                    Source Code: GitHub
                </a>
            </footer>

            <style jsx global>{`
                :root {
                    --main-colorGreen: #1c784c;
                    --main-colorRed: #b7283a;
                    --point-colorOrange: #e56d27;
                    --backColorA: #e39f35;
                    --backColorB: #dce3b1;
                }
                .main,
                .main-table,
                .main-inputContainer {
                    width: 100%;
                }
                .main-inputContainer {
                    display: flex;
                }
                .main-inputLabel {
                }
                .main-input {
                    flex: 1;
                }

                .container {
                    width: 100%;
                    min-height: 100vh;
                    padding: 0 0.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                main {
                    padding: 2rem 1rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                }

                footer {
                    width: 100%;
                    height: 100px;
                    border-top: 1px solid #eaeaea;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                footer img {
                    margin-left: 0.5rem;
                }

                footer a {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                a {
                    color: inherit;
                    text-decoration: none;
                }

                .title a {
                    color: #0070f3;
                    text-decoration: none;
                }

                .title a:hover,
                .title a:focus,
                .title a:active {
                    text-decoration: underline;
                }

                .title {
                    margin: 0;
                    line-height: 1.15;
                    font-size: 4rem;
                }

                .title,
                .description {
                    text-align: center;
                }

                .description {
                    line-height: 1.5;
                    font-size: 1.5rem;
                }

                code {
                    background: #fafafa;
                    border-radius: 5px;
                    padding: 0.75rem;
                    font-size: 1.1rem;
                    font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
                        Bitstream Vera Sans Mono, Courier New, monospace;
                }

                .card:hover,
                .card:focus,
                .card:active {
                    color: #0070f3;
                    border-color: #0070f3;
                }

                .card h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.5rem;
                }

                .card p {
                    margin: 0;
                    font-size: 1.25rem;
                    line-height: 1.5;
                }

                .grid {
                    width: 100%;
                    flex-direction: column;
                }

                table {
                    min-width: 100%;
                }

                thead,
                tbody,
                tr {
                }

                th,
                td {
                    padding: 15px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                th {
                    position: sticky;
                    top: 0;
                    background: var(--main-colorGreen);
                    text-align: left;
                    font-weight: normal;
                    font-size: 1.1rem;
                    color: white;
                }

                th:last-child {
                    border: 0;
                }

                .resize-handle:hover,
            /* The following selector is needed so the handle is visible during resize even if the mouse isn't over the handle anymore */
            .header--being-resized .resize-handle {
                    opacity: 0.5;
                }

                th:hover .resize-handle {
                    opacity: 0.3;
                }

                td {
                    padding-top: 10px;
                    padding-bottom: 10px;
                    color: #808080;
                }

                tr:nth-child(1) th:nth-child(1) {
                    color: white;
                    background: var(--point-colorOrange);
                }
                tr td:nth-child(1) {
                    color: white;
                    background: var(--main-colorRed);
                }

                tr:nth-child(even) td:nth-child(1) {
                    background: var(--main-colorRed);
                    opacity: 0.8;
                }

                tr:nth-child(even) td:not(:nth-child(1)) {
                    background: #f8f6ff;
                }

                [data-type="item-container"] {
                    background: #e08d6c;
                }
            `}</style>
            <style jsx global>{`
                @media (max-width: 600px) {
                    main {
                        padding: 2rem 0rem !important;
                    }
                }
            `}</style>
            <style jsx global>{`
                html,
                body {
                    padding: 0;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
                        Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
                }

                * {
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
};

export default () => (
    <ThemeProvider>
        <Home />
    </ThemeProvider>
);
