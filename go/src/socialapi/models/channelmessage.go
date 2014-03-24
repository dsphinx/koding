package models

import (
	"errors"
	"time"

	"github.com/koding/bongo"
)

type ChannelMessage struct {
	// unique identifier of the channel message
	Id int64

	// Body of the mesage
	Body string

	// type of the message
	Type string

	// Creator of the channel message
	AccountId int64

	// in which channel this message is created
	InitialChannelId int64

	// Creation date of the message
	CreatedAt time.Time

	// Modification date of the message
	UpdatedAt time.Time
}

func (c *ChannelMessage) AfterCreate() {
	bongo.B.AfterCreate(c)
}

func (c *ChannelMessage) AfterUpdate() {
	bongo.B.AfterUpdate(c)
}

func (c *ChannelMessage) AfterDelete() {
	bongo.B.AfterDelete(c)
}

func (c *ChannelMessage) GetId() int64 {
	return c.Id
}

func (c *ChannelMessage) TableName() string {
	return "channel_message"
}

func (c *ChannelMessage) Self() bongo.Modellable {
	return c
}

const (
	ChannelMessage_TYPE_POST  = "post"
	ChannelMessage_TYPE_REPLY = "reply"
	ChannelMessage_TYPE_JOIN  = "join"
	ChannelMessage_TYPE_LEAVE = "leave"
	ChannelMessage_TYPE_CHAT  = "chat"
)

func NewChannelMessage() *ChannelMessage {
	return &ChannelMessage{}
}

func (c *ChannelMessage) Fetch() error {
	return bongo.B.Fetch(c)
}

func (c *ChannelMessage) Update() error {
	// only update body
	return bongo.B.UpdatePartial(c,
		map[string]interface{}{
			"body": c.Body,
		},
	)
}

func (c *ChannelMessage) Create() error {
	return bongo.B.Create(c)
}

func (c *ChannelMessage) Delete() error {
	return bongo.B.Delete(c)
}

func (c *ChannelMessage) FetchByIds(ids []int64) ([]ChannelMessage, error) {
	var messages []ChannelMessage

	if len(ids) == 0 {
		return messages, nil
	}

	if err := bongo.B.FetchByIds(c, &messages, ids); err != nil {
		return nil, err
	}
	return messages, nil
}

func (c *ChannelMessage) FetchRelatives() (*ChannelMessageContainer, error) {
	if c.Id == 0 {
		return nil, errors.New("Channel message id is not set")
	}
	container := NewChannelMessageContainer()
	container.Message = c

	i := NewInteraction()
	i.MessageId = c.Id

	interactions, err := i.List("like")
	if err != nil {
		return nil, err
	}

	interactionContainer := NewInteractionContainer()
	interactionContainer.Actors = interactions
	// check this from database
	interactionContainer.IsInteracted = true

	if container.Interactions == nil {
		container.Interactions = make(map[string]*InteractionContainer)
	}
	if _, ok := container.Interactions["like"]; !ok {
		container.Interactions["like"] = NewInteractionContainer()
	}
	container.Interactions["like"] = interactionContainer
	return container, nil
}
