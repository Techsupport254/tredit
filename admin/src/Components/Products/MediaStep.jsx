import React from 'react';
import { Form, Upload, Button, Row, Col, Input, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { StyledCard, VideoCard } from './StyledComponents';

const { TextArea } = Input;
const { Text } = Typography;

const MediaStep = ({ 
  images, 
  setImages, 
  videos, 
  handleVideoAdd, 
  handleVideoChange, 
  handleVideoDelete, 
  handlePlatformToggle,
  platformIcons 
}) => (
  <Row gutter={[24, 24]}>
    <Col span={24}>
      <StyledCard title="Product Images">
        <Form.Item label="Product Images" required>
          <Upload
            listType="picture-card"
            fileList={images}
            onChange={({ fileList }) => setImages(fileList)}
            beforeUpload={() => false}
            multiple
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
      </StyledCard>
    </Col>

    <Col span={24}>
      <StyledCard title="Product Videos">
        <Button
          type="primary"
          onClick={handleVideoAdd}
          icon={<PlusOutlined />}
          className="mb-4"
        >
          Add New Video
        </Button>

        {videos.map((video, index) => (
          <VideoCard
            key={index}
            $isPlatformSelected={video.platforms?.length > 0}
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleVideoDelete(index)}
              />
            }
          >
            {/* Video card content */}
            <Row gutter={16}>
              <Col span={24}>
                <div className="mb-4">
                  <Text strong>Select Platforms:</Text>
                  <div className="flex gap-4 mt-2">
                    {Object.entries(platformIcons).map(([platform, icon]) => (
                      <Button
                        key={platform}
                        type={
                          video.platforms?.includes(platform)
                            ? "primary"
                            : "default"
                        }
                        icon={icon}
                        onClick={() => handlePlatformToggle(index, platform)}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </Col>
              {/* Rest of the video form fields */}
              {/* ... */}
            </Row>
          </VideoCard>
        ))}
      </StyledCard>
    </Col>
  </Row>
);

export default MediaStep; 