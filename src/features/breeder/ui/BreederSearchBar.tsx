import { Button, Form, Input, Segmented } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { BreederAccountType } from '../api/breederApi';
import { accountTypeFilterEnabled } from '../model/breederFilters';

interface Props {
  searchKeyword: string;
  cityName: string;
  accountType: BreederAccountType;
  onSearch: (values: { searchKeyword: string; cityName: string }) => void;
  onAccountTypeChange: (value: BreederAccountType) => void;
  onReset: () => void;
  onRefresh: () => void;
}

function SearchForm(props: Props) {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      layout="inline"
      initialValues={{ searchKeyword: props.searchKeyword, cityName: props.cityName }}
      onFinish={props.onSearch}
    >
      <Form.Item name="searchKeyword">
        <Input aria-label="브리더 이름 또는 이메일" placeholder="이름 또는 이메일 검색" maxLength={100} allowClear />
      </Form.Item>
      <Form.Item name="cityName">
        <Input aria-label="브리더 지역" placeholder="지역 (예: 서울)" maxLength={50} allowClear />
      </Form.Item>
      <Button htmlType="submit" type="primary" icon={<SearchOutlined />}>
        검색
      </Button>
      <Button
        onClick={() => {
          form.setFieldsValue({ searchKeyword: '', cityName: '' });
          props.onReset();
        }}
      >
        초기화
      </Button>
    </Form>
  );
}

export function BreederSearchBar(props: Props) {
  return (
    <div className="filter-bar breeder-search-bar">
      <SearchForm key={JSON.stringify([props.searchKeyword, props.cityName])} {...props} />
      <div className="breeder-search-options">
        <span>계정 구분</span>
        <Segmented
          aria-label="계정 구분"
          value={props.accountType}
          onChange={props.onAccountTypeChange}
          options={[
            { label: '전체', value: 'all' },
            { label: '일반', value: 'normal', disabled: !accountTypeFilterEnabled },
            { label: '테스트', value: 'test', disabled: !accountTypeFilterEnabled },
          ]}
        />
        <Button aria-label="목록 새로고침" icon={<ReloadOutlined />} onClick={props.onRefresh} />
      </div>
    </div>
  );
}
