import styled from 'styled-components';
import { Card, InputNumber } from 'antd';

export const StyledCard = styled(Card)`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const VideoCard = styled(Card)`
  margin-top: 16px;
  border-radius: 8px;
  background: ${(props) => (props.$isPlatformSelected ? "#f8f9ff" : "#fff")};
  border: 1px solid
    ${(props) => (props.$isPlatformSelected ? "#4096ff" : "#d9d9d9")};
`;

export const PlatformIcon = styled.div`
  font-size: 24px;
  margin-right: 8px;
  opacity: ${(props) => (props.$isSelected ? 1 : 0.5)};
  transition: all 0.3s ease;
`;

export const PriceInput = styled(InputNumber)`
  width: 100%;
  .ant-input-number-group-addon {
    background-color: #f0f2f5;
    color: #666;
    font-weight: 500;
  }
`; 